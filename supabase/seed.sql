-- Starter role library. Edit, add or remove rows freely.
insert into dossiers (codename, display_name, archetype, cover_story, secret_motive, ally, rival) values
  ('the-magpie', 'THE MAGPIE', 'A venture capitalist who collects secrets like jewels', 'Funded half the room; everyone owes you a favour', 'Acquire the access codes to the £30M asset before midnight', 'THE CARTOGRAPHER', 'THE WIDOW'),
  ('the-widow', 'THE WIDOW', 'Inherited an empire under suspicious circumstances', 'The grieving heir, gracious and untouchable', 'Protect your inheritance from a clawback only you know is coming', 'THE PRIEST', 'THE MAGPIE'),
  ('the-cartographer', 'THE CARTOGRAPHER', 'A fixer who maps everyone''s weaknesses', 'The quiet one who knows where the bodies are', 'Sell your map of the room to the highest bidder tonight', 'THE MAGPIE', 'THE SOMMELIER'),
  ('the-sommelier', 'THE SOMMELIER', 'A connoisseur whose hobby is poisons', 'Pouring the finest in the house, charming everyone', 'Settle an old debt before the clock strikes twelve', 'THE WIDOW', 'THE CARTOGRAPHER'),
  ('the-architect', 'THE ARCHITECT', 'Built the vault holding the asset', 'The genius who designed the unbreakable', 'Prove the vault is flawless — or that you already cracked it', 'THE BANKER', 'THE MAGPIE'),
  ('the-clock', 'THE CLOCK', 'Keeps everyone''s timelines and alibis', 'The punctual, forgettable observer', 'Blackmail the one person whose alibi doesn''t hold', 'THE ARCHITECT', 'THE PRIEST'),
  ('the-priest', 'THE PRIEST', 'Trusted confessor of the entire room', 'The one everyone tells their secrets to', 'You are the mastermind of tonight''s betrayal', 'THE WIDOW', 'THE CLOCK'),
  ('the-diplomat', 'THE DIPLOMAT', 'Brokered the deal that made the asset go live', 'The smooth operator who made it all happen', 'Hide that you skimmed millions off the top of the deal', 'THE SOMMELIER', 'THE SIREN'),
  ('the-siren', 'THE SIREN', 'A performer who overhears everything', 'The dazzling entertainer of the evening', 'Find out who really killed your patron last winter', 'THE GHOST', 'THE DIPLOMAT'),
  ('the-ghost', 'THE GHOST', 'Supposedly died years ago', 'A stranger no one quite recognises', 'Expose whoever faked your death and stole your name', 'THE SIREN', 'THE WIDOW'),
  ('the-banker', 'THE BANKER', 'Holds the only key to move the asset', 'The nervous VIP everyone is suddenly very nice to', 'Simply survive the night — everyone wants what you hold', 'THE ARCHITECT', 'THE MAGPIE'),
  ('the-journalist', 'THE JOURNALIST', 'Undercover to break the story of the decade', 'A plus-one no one invited', 'Get one person on record confessing before you leave', 'THE GHOST', 'THE PRIEST');
