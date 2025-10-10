import plotly.graph_objects as go
import plotly.express as px

# Data from the provided JSON
data = {
    "deliverables": [
        {
            "name": "Desktop/Web Platform", 
            "files": 5, 
            "components": ["TikTok Live Integration", "WebGPU 3D Engine", "HTML Interface", "Documentation"], 
            "technologies": ["Python", "Three.js", "WebGPU", "WebSockets"], 
            "audience": "Desktop Streamers", 
            "status": "Production Ready",
            "color": "#8A2BE2"
        },
        {
            "name": "Mobile React Native App", 
            "files": 8, 
            "components": ["Mobile WebGPU Engine", "Touch Controls", "Haptic Feedback", "Build System"], 
            "technologies": ["React Native", "WebGPU Mobile", "Gesture Handler", "Haptic API"], 
            "audience": "Mobile Streamers", 
            "status": "App Store Ready",
            "color": "#0EA5E9"
        },
        {
            "name": "Investor Demo Package", 
            "files": 2, 
            "components": ["Interactive Demo", "Pitch Deck", "Market Analysis", "Tech Showcase"], 
            "technologies": ["Interactive HTML", "Canvas Rendering", "Market Research"], 
            "audience": "Investors & Partners", 
            "status": "Presentation Ready",
            "color": "#F59E0B"
        }
    ],
    "timeline": [
        {"phase": "Concept", "duration": "Day 1"},
        {"phase": "Desktop Dev", "duration": "Day 1-2"},
        {"phase": "Mobile Dev", "duration": "Day 2-3"},
        {"phase": "Investor Mat", "duration": "Day 3"},
        {"phase": "Market Launch", "duration": "Next Phase"}
    ]
}

# Extract colors from data
colors = [d["color"] for d in data["deliverables"]]

# Prepare data for the chart
deliverable_names = []
file_counts = []
hover_texts = []
status_texts = []

for d in data["deliverables"]:
    # Shorten names to fit 15 char limit where possible
    short_name = d["name"].replace("Desktop/Web Platform", "Desktop/Web").replace("Mobile React Native App", "Mobile App").replace("Investor Demo Package", "Investor Demo")
    deliverable_names.append(short_name)
    file_counts.append(d["files"])
    
    # Create comprehensive hover text
    components_str = ", ".join(d["components"][:3])  # Show first 3 components
    tech_str = ", ".join(d["technologies"][:3])  # Show first 3 technologies
    
    hover_text = (
        f"<b>{d['name']}</b><br>"
        f"Files: {d['files']}<br>"
        f"Status: {d['status']}<br>"
        f"Audience: {d['audience']}<br>"
        f"Technologies: {tech_str}<br>"
        f"Components: {components_str}"
    )
    hover_texts.append(hover_text)
    
    # Status for display
    status_texts.append(d['status'])

# Create the figure
fig = go.Figure()

# Add horizontal bars for each deliverable
for i, (name, files, hover, status) in enumerate(zip(deliverable_names, file_counts, hover_texts, status_texts)):
    fig.add_trace(go.Bar(
        y=[name],
        x=[files],
        orientation='h',
        name=name,
        marker_color=colors[i],
        hovertemplate=hover + "<extra></extra>",
        text=f"{files} files • {status}",
        textposition="auto",
        textfont=dict(color="white", size=11)
    ))

# Add timeline information as annotations
timeline_text = " → ".join([f"{t['phase']} ({t['duration']})" for t in data["timeline"]])

# Update layout
fig.update_layout(
    title="Hyperfocus Gift Engine: Complete Ecosystem",
    xaxis_title="Files Created",
    yaxis_title="Deliverables",
    showlegend=False,
    yaxis=dict(categoryorder="total ascending"),
    annotations=[
        dict(
            x=0.5, y=1.15,
            xref="paper", yref="paper",
            text=f"Timeline: {timeline_text}",
            showarrow=False,
            font=dict(size=10, color="gray"),
            xanchor="center"
        ),
        dict(
            x=0.02, y=0.02,
            xref="paper", yref="paper",
            text="Desktop: 5 files | Mobile: 8 files | Demo: 2 files",
            showarrow=False,
            font=dict(size=9, color="gray"),
            xanchor="left"
        )
    ]
)

# Update axes
fig.update_xaxes(title="Files Created", showgrid=True, gridwidth=1, gridcolor='lightgray', range=[0, 10])
fig.update_yaxes(title="", showgrid=False)

# Remove clip on axis for better visibility
fig.update_traces(cliponaxis=False)

# Save as both PNG and SVG
fig.write_image("hyperfocus_ecosystem.png")
fig.write_image("hyperfocus_ecosystem.svg", format="svg")

fig.show()