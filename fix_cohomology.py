import re

with open('enhanced_simulation.py', 'r') as f:
    content = f.read()

# Fix the cohomology return statement
content = re.sub(
    r"'self\.graph\.number_of_nodes\(\)': n_vertices,\s*'self\.graph\.number_of_edges\(\)': n_edges",
    "'n_vertices': self.graph.number_of_nodes(),\n            'n_edges': self.graph.number_of_edges()",
    content
)

with open('enhanced_simulation.py', 'w') as f:
    f.write(content)

print("Fixed cohomology return statement")
