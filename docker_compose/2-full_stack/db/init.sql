CREATE TABLE materias (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    effect VARCHAR(200)
);

INSERT INTO
    materias (
        name,
        type,
        description,
        effect
    )
VALUES (
        'Fire',
        'Magic',
        'Summons a burst of flame to scorch enemies.',
        'Deals fire damage to a single target'
    ),
    (
        'Ice',
        'Magic',
        'Conjures freezing shards of ice.',
        'Deals ice damage to a single target'
    ),
    (
        'Lightning',
        'Magic',
        'Calls down a bolt of lightning.',
        'Deals lightning damage to a single target'
    ),
    (
        'Cure',
        'Magic',
        'Channels restorative energy.',
        'Restores HP to a single target'
    ),
    (
        'All',
        'Support',
        'Extends the range of a linked materia.',
        'Targets all enemies or allies'
    ),
    (
        'Enemy Skill',
        'Independent',
        'Learns abilities used by enemies.',
        'Grants access to enemy abilities once learned'
    ),
    (
        'HP Absorb',
        'Support',
        'Drains life force from the target.',
        'Restores HP equal to damage dealt'
    ),
    (
        'Mime',
        'Independent',
        'Mimics the last action taken.',
        'Repeats the previous command at no cost'
    );
