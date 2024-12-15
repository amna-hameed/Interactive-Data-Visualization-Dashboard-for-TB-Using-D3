# Interactive-Data-Visualization-Dashboard-for-TB-Using-D3
Interactive data visualization dashboard that analyzes relationships between entities concerning various dimensions such as location, timestamp, and type of relationship.
# Data Requirements
 Dataset: Utilize the TB dataset, focusing on attributes such as:
o Relationship Type: Type of relationship between entities (e.g.,
collaboration, conflict).
o Location: Geographic coordinates or identifiers of entities.
o Timestamp: Date and time indicating when the relationship was
recorded.
o Entity IDs: Unique identifiers for each entity involved in relationships.

o Path: Descriptive paths indicating the nature of relationships or
interactions.

 Data Preparation: Preprocess the dataset to ensure it is clean, structured
appropriately for visualizations, and ready for hierarchical analysis if applicable.

# Key Visualizations and Features
1. Force-Directed Graph for Relationship Mapping
o Description: A network visualization that displays entities as nodes and
their relationships as edges.
o Features:
 Nodes represent entities, while edges signify relationships
between them.
 Color Coding: Different colors represent various relationship
types for quick identification.
 Interactivity:
 Hovering over nodes reveals detailed information.
 Click actions to expand nodes for deeper insights.
 Zooming and panning to explore the network.
 Filters: Dynamic filters allow users to select specific relationship
types, enhancing data exploration.
2. Map Chart for Geographic Representation
o Description: Visualizes entities based on their geographic locations.
o Features:
 Pins on the map indicate entity locations, color-coded by
relationship type.

 Interactive Features:
 Zoom and pan functionality to explore different geographic
areas.
 Hovering over pins displays details about specific locations,
while clicking highlights related entities.

 Filters: Users can filter by region or relationship type to focus on
specific data points.

3. Timeline Visualization with Animation
o Description: An animated timeline illustrating the evolution of
relationships over time.
o Features:
 Data points are plotted against timestamps, showing changes and
developments in relationships.
 A playable animation allows users to observe how relationships
progress over time.
 Interactivity: Users can pause the animation to examine specific
timeframes.
 Filters: A date range slider enables users to filter visible data based
on selected time intervals.

o Example:

https://observablehq.com/@mbostock/the-wealth-health-of-
nations

4. Hierarchical Tree Map for Entity Categorization
o Description: Represents relationships in a hierarchical format based on
entity types or categories.
o Features:

 Nested Rectangles illustrate different levels of the hierarchy (e.g.,
departments within organizations).
 Size and color reflect metrics such as the frequency of relationships
or intensity.
 Interactivity: Drill-down functionality allows exploration of
deeper hierarchical levels, along with breadcrumb navigation for
easy backtracking.
 Filters: Hierarchical level filters provide tailored views to
investigate specific categories.

5. Sunburst Chart for Hierarchical Data (Bonus Visualization)
o Description: A radial chart depicting hierarchical relationships in a
circular layout.
o Features:
 Inner rings represent higher hierarchy levels; outer rings show
subcategories.
 Color-coded by relationship type or category for quick visual
distinction.
 Interactivity: Hovering reveals details; clicking allows users to
zoom into specific categories.
 Filters: Synchronization with other visualizations based on user
selection enhances the exploration experience.

# Advanced Interactivity Features
 Focus-Plus-Context (Zoom and Detail): Users can zoom into specific
visualization areas while maintaining an overview of the broader context.

 Hover and Tooltip Details: Enhanced tooltips provide in-depth information,
including entity details, relationship strength, timestamps, and other metrics.

 On-Click Actions: Clicking on nodes or visual elements triggers cross-
visualization interactions, allowing users to focus on related data.

 Dynamic Filtering and Sorting: Multiple filters for relationship types,
locations, timestamps, and metrics, along with sorting options to streamline data
analysis.
 Interactive Legend: A dynamic legend allows toggling the visibility of
relationship types across all visualizations in real time.

Bonus Features for Additional Points

1. Exceptional Interactivity (5% bonus): Implement advanced focus-plus-
context features and intuitive custom tooltips.

2. Animated Transitions and Smooth Zooming (5% bonus): Ensure high-
quality animations for zooming, expanding, and collapsing elements.

3. Responsive Design and Compatibility (5% bonus): Optimize the dashboard
for compatibility across devices and browsers.
4. Advanced Filtering and Sorting Options (5% bonus): Offer comprehensive
filtering and sorting mechanisms for refined data exploration.
5. Customizable and Exportable Views (5% bonus): Enable users to customize
visualization settings and download images in various formats.
6. Enhanced Tooltip Information and Insights (5% bonus): Tooltips
containing detailed, dynamic insights based on entity relationships.
7. Dynamic and Interactive Legend (5% bonus): A responsive legend that
updates visualizations in real time as categories are toggled.
8. Dashboard State Persistence (5% bonus): Save user settings such as filters and
zoom levels in local storage.

9. Hierarchical Data Drill-Down with Breadcrumb Navigation (5% bonus):
Smooth navigation through hierarchical data with breadcrumb support.
10.Cross-Visualization Interaction (5% bonus): Enable selections in one
visualization to update related data across others in real time.
