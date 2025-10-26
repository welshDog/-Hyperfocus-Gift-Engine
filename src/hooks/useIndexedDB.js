import { useCallback } from 'react'

export function useIndexedDB() {
  const DB_NAME = 'GiftEngineDB'
  const DB_VERSION = 1
  const STORE_NAME = 'gifts'

  const openDB = useCallback(() => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('user', 'user.username', { unique: false })
          store.createIndex('giftName', 'gift.name', { unique: false })
        }
      }
    })
  }, [])

  const saveGift = useCallback(async (gift) => {
    try {
      const db = await openDB()
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      await new Promise((resolve, reject) => {
        const request = store.put(gift)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })

      db.close()
    } catch (error) {
      console.error('Error saving gift to IndexedDB:', error)
    }
  }, [openDB])

  const getGifts = useCallback(async (limit = 1000) => {
    try {
      const db = await openDB()
      const transaction = db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('timestamp')

      return new Promise((resolve, reject) => {
        const request = index.openCursor(null, 'prev') // Most recent first
        const results = []

        request.onsuccess = (event) => {
          const cursor = event.target.result
          if (cursor && results.length < limit) {
            results.push(cursor.value)
            cursor.continue()
          } else {
            resolve(results)
            db.close()
          }
        }

        request.onerror = () => {
          reject(request.error)
          db.close()
        }
      })
    } catch (error) {
      console.error('Error getting gifts from IndexedDB:', error)
      return []
    }
  }, [openDB])

  const clearGifts = useCallback(async () => {
    try {
      const db = await openDB()
      const transaction = db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      await new Promise((resolve, reject) => {
        const request = store.clear()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })

      db.close()
    } catch (error) {
      console.error('Error clearing gifts from IndexedDB:', error)
    }
  }, [openDB])

  const getGiftStats = useCallback(async () => {
    try {
      const gifts = await getGifts()
      const totalGifts = gifts.length
      const totalValue = gifts.reduce((sum, gift) => sum + (gift.value || 0), 0)
      const uniqueUsers = new Set(gifts.map(gift => gift.user?.username)).size

      return {
        totalGifts,
        totalValue,
        uniqueUsers,
        averageValue: totalGifts > 0 ? totalValue / totalGifts : 0
      }
    } catch (error) {
      console.error('Error calculating gift stats:', error)
      return {
        totalGifts: 0,
        totalValue: 0,
        uniqueUsers: 0,
        averageValue: 0
      }
    }
  }, [getGifts])

  return {
    saveGift,
    getGifts,
    clearGifts,
    getGiftStats
  }
}
