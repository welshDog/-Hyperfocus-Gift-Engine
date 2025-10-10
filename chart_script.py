import plotly.graph_objects as go
import json

# Data from the provided JSON
data = {
    "approaches": [
        {
            "name": "React Native + WebGPU", 
            "ratings": {"Development Speed": 4, "Performance": 5, "Code Reuse": 5, "Native Features": 4, "User Experience": 5, "Maintenance": 4}, 
            "strengths": "WebGPU mobile support, 200% performance boost, desktop-class 3D rendering", 
            "color": "#8A2BE2"
        }, 
        {
            "name": "PWA + TWA", 
            "ratings": {"Development Speed": 5, "Performance": 3, "Code Reuse": 5, "Native Features": 2, "User Experience": 3, "Maintenance": 5}, 
            "strengths": "Instant conversion from web version, zero learning curve, single codebase", 
            "color": "#00CED1"
        }, 
        {
            "name": "Flutter + WebView", 
            "ratings": {"Development Speed": 2, "Performance": 3, "Code Reuse": 2, "Native Features": 5, "User Experience": 4, "Maintenance": 3}, 
            "strengths": "Full native UI control, complete device integration, traditional approach", 
            "color": "#FFD700"
        }
    ]
}

# Create the radar chart
fig = go.Figure()

# Criteria labels (shortened to fit 15 char limit)
criteria = ["Dev Speed", "Performance", "Code Reuse", "Native Feat", "User Exp", "Maintenance"]

# Add each approach as a trace
for approach in data["approaches"]:
    # Get ratings in the same order as criteria
    ratings = [
        approach["ratings"]["Development Speed"],
        approach["ratings"]["Performance"], 
        approach["ratings"]["Code Reuse"],
        approach["ratings"]["Native Features"],
        approach["ratings"]["User Experience"],
        approach["ratings"]["Maintenance"]
    ]
    
    # Shorten approach name for legend
    name_short = approach["name"].replace("React Native + WebGPU", "RN + WebGPU").replace("Flutter + WebView", "Flutter + WebV")
    
    fig.add_trace(go.Scatterpolar(
        r=ratings + [ratings[0]],  # Close the shape by repeating first value
        theta=criteria + [criteria[0]], # Close the shape by repeating first theta
        fill='toself',
        name=name_short,
        line_color=approach["color"],
        fillcolor=approach["color"],
        opacity=0.3
    ))

# Update layout
fig.update_layout(
    title="Mobile App Approaches",
    polar=dict(
        radialaxis=dict(
            visible=True,
            range=[0, 5],
            tickvals=[1, 2, 3, 4, 5],
            ticktext=['1⭐', '2⭐', '3⭐', '4⭐', '5⭐']
        )
    ),
    legend=dict(
        orientation='h', 
        yanchor='bottom', 
        y=1.05, 
        xanchor='center', 
        x=0.5
    )
)

# Save the chart
fig.write_image("mobile_approaches_radar.png")
fig.write_image("mobile_approaches_radar.svg", format="svg")

print("Radar chart created successfully!")
print("\nApproach Strengths:")
for approach in data["approaches"]:
    print(f"\n{approach['name']}: {approach['strengths']}")