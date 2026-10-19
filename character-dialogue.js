/* Shared dialogue source. Edit lines here; the game and catalogue use the same arrays. */
(() => {
 'use strict';
 const characters = [
  {
    "id": "hero",
    "name": "AJŤÁK",
    "groups": [
      {
        "id": "death",
        "label": "Text po prohře",
        "lines": [
          "Jdeš na povinné školení řízení vysokozdvižných vozíků v serverovnách s vodním chlazením. Plavky s sebou.",
          "Vyplníš dotazník „Nechceme jíst maso v závodní jídelně“. Má 94 otázek. Všechny jsou povinné.",
          "Jdeš nastavit přístupová hesla ke kávě zdarma pro jedno kolego. Každý nápoj musí mít jiné heslo a dvoufázové ověření.",
          "Čeká tě rychlá porada o tom, proč jsou porady příliš dlouhé. Rezervováno do pátku.",
          "Byl jsi jmenován koordinátorem přechodu z disket na HDD s regulačním šroubem.",
          "Jdeš ručně inventarizovat cloud. Žebřík si vyzvedni na recepci.",
          "Musíš obnovit smazanou prezentaci o důležitosti zálohování.",
          "Dostal jsi za úkol opravit výtahy. Přístupová karta je v devátém patře.",
          "Jdeš schválit žádost o přístup k formuláři pro podání žádosti o přístup.",
          "Povinný brainstorming právě začíná. Téma: voláme na servicedesk efektivně."
        ]
      }
    ]
  },
  {
    "id": "secretary",
    "name": "SEKRETÁŘKA",
    "groups": [
      {
        "id": "contact",
        "label": "Zvuk při kontaktu",
        "lines": [
          "ÁÁÁÁ!",
          "Šéfeee"
        ]
      }
    ]
  },
  {
    "id": "union",
    "name": "ODBORÁŘ",
    "groups": [
      {
        "id": "contact",
        "label": "Hlášky při kontaktu",
        "lines": [
          "PÍÍÍÍ!",
          "Ne, když hlídám já!",
          "Ukaž mi kartičku.",
          "Byl si na schůzi, mladíků?",
          "Počítám s tebou brácho.",
          "Ještě jednou a máme pohotovost!",
          "Tady nejste v Německu pane kolego."
        ]
      }
    ]
  },
  {
    "id": "manager",
    "name": "MANAŽER",
    "groups": [
      {
        "id": "contact",
        "label": "Dupání při kontaktu",
        "lines": [
          "DUP! DUP!",
          "Pomazeš do wobu lotře.",
          "Saša jede!"
        ]
      }
    ]
  },
  {
    "id": "old_it",
    "name": "STARÝ AJŤÁK",
    "groups": [
      {
        "id": "beer",
        "label": "Nabídka piva",
        "lines": [
          "Ááá, plznička ",
          "Chcaní bez prdu, to je jak láska bez mrd.. polibku teda…",
          "Neviděli jste tu Laca?",
          "Hesla měnil naposled Vosahlo šetrným štítkem."
        ]
      },
      {
        "id": "hotdog",
        "label": "Nabídka párku",
        "lines": [
          "Dej si párek!",
          "Teplej páreka a studená němka. nebo tak nějak to bylo."
        ]
      },
      {
        "id": "peek",
        "label": "Vykouknutí a odchod",
        "lines": [
          "Hele…ryba",
          "stál a čuměl",
          "Ať mi skočej na cara",
          "Jdu se kouknout, jestli venku prší "
        ]
      }
    ]
  },
  {
    "id": "specialist",
    "name": "SPECIALISTKA",
    "groups": [
      {
        "id": "combat",
        "label": "Během souboje a při kontaktu",
        "lines": [
          "Byl si na prajtu?",
          "Tohle není fér!",
          "Kňůůůů"
        ]
      }
    ]
  },
  {
    "id": "security_guard",
    "name": "BEZPEČÁK",
    "groups": [
      {
        "id": "combat",
        "label": "Při útoku a kontaktu",
        "lines": [
          "Kačka12 na V8",
          "No jen aby to nebyla Remíza.",
          "No user, no problém."
        ]
      }
    ]
  },
  {
    "id": "hr_manager",
    "name": "HR MANAŽERKA",
    "groups": [
      {
        "id": "combat",
        "label": "Při útoku a kontaktu",
        "lines": [
          "Kde seš, ty lumpiku?",
          "Na slovíčko panáčku.",
          "Máte někdo kompas?"
        ]
      }
    ]
  },
  {
    "id": "design_manager",
    "name": "MANAŽER DESIGNU",
    "groups": [
      {
        "id": "combat",
        "label": "Při útoku a kontaktu",
        "lines": [
          "Tohle ti změní paradigma."
        ]
      },
      {
        "id": "contact",
        "label": "Při kontaktu",
        "lines": [
          "Uhni citróne!",
          "Už máš diplom surfaře?"
        ]
      }
    ]
  },
  {
    "id": "sap_integrator",
    "name": "ŠÉF SAP",
    "groups": [
      {
        "id": "combat",
        "label": "Během souboje",
        "lines": [
          "TO JE GLOBÁLNÍ ŘEŠENÍ!",
          "CO₂ MUSÍ DOLŮ!",
          "TO MUSÍME INTEGROVAT!",
          "SAP TO VYŘEŠÍ!",
          "JEZDĚTE NA KOLE!",
          "KDE MÁTE ROADMAPU?",
          "NEJDŘÍV TO ALAJNUJEME!"
        ]
      }
    ]
  },
  {
    "id": "it_colleague",
    "name": "IT KOLEGA",
    "groups": [
      {
        "id": "coffee",
        "label": "Nabídka kávy",
        "lines": [
          "restart v kelímku?",
          "Nejdřív kafe. Pak zázraky.",
          "Nazdar chlapíci!",
          "Klídek, všechno dobře dopadne."
        ]
      },
      {
        "id": "candy",
        "label": "Nabídka Sisinky",
        "lines": [
          "Sisinka. Hotfix trudomyslnosti",
          "Cukr a kafe, víc není třeba ",
          "Nazdar chlapíci!",
          "Klídek, všechno dobře dopadne."
        ]
      }
    ]
  },
  {
    "id": "old_badger",
    "name": "SENIOR MASTER",
    "groups": [
      {
        "id": "ambient",
        "label": "Při setkání",
        "lines": [
          "UHNI, MLADÍKU!",
          "JÁ TADY PRACUJU!",
          "TO ZA NÁS NEBÝVALO!",
          "ZASE NĚJAKÁ NOVINKA?",
          "KLID, JÁ TO VYŘEŠÍM!",
          "JÁ NIKAM NESPĚCHÁM!",
          "TEN VÝTAH VŽDYCKY FUNGOVAL!"
        ]
      },
      {
        "id": "block",
        "label": "Po zablokování střely",
        "lines": [
          "NA MĚ SI NEPŘIJDEŠ!",
          "TO MĚ NEROZHODÍ!"
        ]
      }
    ]
  },
  {
    "id": "dbpm",
    "name": "PROJEKŤÁK DBPM",
    "groups": [
      {
        "id": "chase",
        "label": "Pronásledování",
        "lines": [
          "teraz som plně vytížený",
          "som šel oba po povrche"
        ]
      },
      {
        "id": "attack",
        "label": "Útok",
        "lines": [
          "u zákazníka máte připraven cervenej koberec",
          "navrhuji další meeting na tohle téma"
        ]
      },
      {
        "id": "hit",
        "label": "Zásah",
        "lines": [
          "teď už jen doleštime ten diamant"
        ]
      },
      {
        "id": "demand",
        "label": "Nová tabulka",
        "lines": [
          "Dycky DEMAND!",
          "Tak uděláme novou tabulku,ne?"
        ]
      }
    ]
  },
  {
    "id": "gen_z",
    "name": "GEN Z – HOLKA A KLUČINA",
    "groups": [
      {
        "id": "block",
        "label": "Blokování cesty",
        "lines": [
          "Tak já snad uhýbat nebudu!",
          "V klídku, jdu si jenom pro kafe.",
          "Sorry, nemám sociální baterku.",
          "Já jen scrolluju.",
          "Jasný, úplně v pohodě."
        ]
      },
      {
        "id": "work",
        "label": "Práce a generace",
        "lines": [
          "Už jsem v práci tři hodiny, tak snad už bych měl jít domů.",
          "Pět dní home officeu v týdnu je snad samozřejmost.",
          "A tobě je čtyřicet a ještě žiješ?",
          "Jasný, mám depresi.",
          "Teď už mi je tři… ne, šestnáct… kecám, dvacet dva.",
          "Dneska už mám splněno. Byl jsem online."
        ]
      },
      {
        "id": "slang",
        "label": "Slang / odchod",
        "lines": [
          "Six, seven!",
          "To je trochu skibidi.",
          "Tohle je lepší než real life.",
          "No cap.",
          "Lowkey to nedává smysl.",
          "To je mega cringe.",
          "Main character energy.",
          "To je vibe.",
          "Fr fr."
        ]
      }
    ]
  }
];
 window.ITHeroDialogue={characters,lines(id,group){return characters.find(c=>c.id===id)?.groups.find(g=>g.id===group)?.lines || [];}};
})();
