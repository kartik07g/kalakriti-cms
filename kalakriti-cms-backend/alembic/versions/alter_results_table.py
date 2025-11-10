"""alter results table

Revision ID: alter_results_table
Revises: create_contact_us_table
Create Date: 2025-01-27 12:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'alter_results_table'
down_revision: Union[str, None] = 'create_contact_us_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Drop old columns
    op.drop_column('results', 'user_name')
    op.drop_column('results', 'event_name')
    op.drop_column('results', 'season')
    
    # Add new columns
    op.add_column('results', sa.Column('name', sa.String(length=255), nullable=False))
    op.add_column('results', sa.Column('user_id', sa.String(length=20), nullable=False))
    op.add_column('results', sa.Column('score', sa.Integer(), nullable=False))
    op.add_column('results', sa.Column('remarks', sa.Text(), nullable=True))
    op.add_column('results', sa.Column('category', sa.String(length=255), nullable=False))
    op.add_column('results', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    op.add_column('results', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Remove new columns
    op.drop_column('results', 'updated_at')
    op.drop_column('results', 'created_at')
    op.drop_column('results', 'category')
    op.drop_column('results', 'remarks')
    op.drop_column('results', 'score')
    op.drop_column('results', 'user_id')
    op.drop_column('results', 'name')
    
    # Add back old columns
    op.add_column('results', sa.Column('user_name', sa.String(length=255), nullable=False))
    op.add_column('results', sa.Column('event_name', sa.String(length=255), nullable=False))
    op.add_column('results', sa.Column('season', sa.String(length=100), nullable=False))