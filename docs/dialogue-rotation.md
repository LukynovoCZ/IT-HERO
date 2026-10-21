# Náhodné střídání hlášek

`ITHeroDialogue.draw(id, group)` používá náhodně promíchaný seznam bez opakování uvnitř cyklu. Každá hláška má stejné zastoupení, včetně dlouhých. Nový cyklus nezačíná poslední hláškou předchozího cyklu, pokud existuje jiná možnost.

Zbývající seznamy se ukládají do localStorage pod `it-hero-dialogue-rotation-v1` pro každou postavu, situaci a public/původní vzhled. Pokračují po restartu kampaně i obnovení stránky ve stejném prohlížeči a na stejné adrese. Při blokovaném úložišti funguje paměťový režim. Změna obsahu konkrétního seznamu obnoví jeho cyklus. Poškozené uložené údaje se ignorují.

Společný systém spotřebuje položku až po kontrole viditelnosti, cooldownu a dostupného místa pro bublinu. Používají jej i hlášky po smrti, sojka a DžejTýho triky. Výslovné dějové hlášky zůstávají určené událostí. Jednotlivé situace mají vlastní seznamy: například hlášku při zásahu lze slyšet jen při zásahu, nikoli náhodně v klidu.

Test: `node tests/dialogue-rotation.cjs`.
