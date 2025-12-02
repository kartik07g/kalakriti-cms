from jinja2 import Environment, FileSystemLoader
import os

# Assuming your templates are in a folder called "email_templates"
TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), '../artifacts')
env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))

def render_template(template_name: str, context: dict) -> str:
    template = env.get_template(template_name)
    return template.render(context)
