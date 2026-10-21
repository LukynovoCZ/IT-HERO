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
          "Šéfeee",
          "kdo je tam za IT? ",
          "ještě jednou, pro blondýnu",
          "a máš to schválený?"
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
      },
      {
        "id": "hit",
        "label": "Po zásahu",
        "lines": [
          "to je jeden faul za druhým"
        ]
      },
      {
        "id": "attack",
        "label": "Před útokem",
        "lines": [
          "ani očko nenasadíš"
        ]
      },
      {
        "id": "repeated_hit",
        "label": "Opakované poškození",
        "lines": [
          "kolegové byli velmi rozezleni a zloba možná bude mnohem větší"
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
      },
      {
        "id": "intro",
        "label": "Zahájení finálního souboje",
        "lines": [
          "teď přijde disklejmr z mojí strany"
        ]
      },
      {
        "id": "special",
        "label": "Příprava speciálního útoku",
        "lines": [
          "potřebuji pevný stejtment",
          "tohle musí mít jasné kontury"
        ]
      },
      {
        "id": "phase",
        "label": "Změna fáze souboje",
        "lines": [
          "je třeba zakotvit definitivum"
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
          "Hesla měnil naposled Vosálo děrným štítkem."
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
          "Jdu se kouknout, jestli venku prší ",
          "mám v <> nějaký péří",
          "koukám, zase jedeme na mrtvém koni?"
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
        "originalLines": ["Kňůůůů"],
        "label": "Během souboje a při kontaktu",
        "lines": [
          "Byl si na prajtu?",
          "Tohle není fér!"
        ]
      }
    ]
  },
  {
    "id": "security_guard",
    "name": "Security master",
    "groups": [
      {
        "id": "combat",
        "label": "Při útoku a kontaktu",
        "lines": [
          "Kačka12 na V8",
          "No jen aby to nebyla Remíza.",
          "No user, no problém.",
          "Naše stanovisko je jasné \"NE\"!",
          "zjisti mi"
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
          "Máte někdo kompas?",
          "Je k dispozici nějaký specialista na danou problematiku?",
          "máme pro vás značnou verbální podporu",
          "mám vás snad vodit za ručičku?"
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
          "Tohle ti změní paradigma.",
          "koukejte vyleštit ty prezentace",
          "pěkně připravená schůzka"
        ]
      },
      {
        "id": "contact",
        "label": "Při kontaktu",
        "lines": [
          "Uhni citróne!",
          "Už máš diplom surfaře?",
          "teď se buď ztrácím, nebo s vámi úplně nesouhlasím"
        ]
      },
      {
        "id": "ambient",
        "label": "Běžné komentáře",
        "lines": [
          "exteriér je obecný urban"
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
          "NEJDŘÍV TO ALAJNUJEME!",
          "elajnovat se kolego, elajnovat",
          "byla vytyčena cesta"
        ]
      },
      {
        "id": "hit",
        "label": "Po zásahu",
        "lines": [
          "toto není férové srovnání"
        ]
      },
      {
        "id": "strong",
        "label": "Silný útok",
        "lines": [
          "Jelikož tomu nerozumíte, tak to nemůžete chápat"
        ]
      },
      {
        "id": "melee",
        "label": "Nápřah pumpičkou",
        "lines": [
          "dívám se na to holisticky"
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
          "Klídek, všechno dobře dopadne.",
          "maká za mě mikina a bágl"
        ]
      },
      {
        "id": "candy",
        "label": "Nabídka Sisinky",
        "lines": [
          "Sisinka. Hotfix trudomyslnosti",
          "Cukr a kafe, víc není třeba ",
          "Nazdar chlapíci!",
          "Klídek, všechno dobře dopadne.",
          "Motáme se v kruzích, pane Frodo"
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
          "TEN VÝTAH VŽDYCKY FUNGOVAL!",
          "Koukej se mi na ruce, nebudu tady věčně.",
          "Pojď a uč se od mistra.",
          "Učíš Vorla lítat.",
          "Já si du pro buchtu a oni maj jen vylizanej pekáč."
        ]
      },
      {
        "id": "block",
        "label": "Po zablokování střely",
        "lines": [
          "NA MĚ SI NEPŘIJDEŠ!",
          "TO MĚ NEROZHODÍ!",
          "tak to je naprostá blbost"
        ]
      },
      {
        "id": "rage",
        "label": "Po pěti zablokovaných střelách",
        "lines": [
          "pár ran schytal, ale odešel po čtyřech"
        ]
      },
      {
        "id": "pause",
        "label": "Při zastavení",
        "lines": [
          "přijde mi zbytečné dělat teď nějaké rychlé pohyby"
        ]
      },
      {
        "id": "snack",
        "label": "Při pití kávy nebo snědení Sisinky",
        "lines": [
          "To bych vodnes na vocase"
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
          "som šel oba po povrche",
          "sedá si to",
          "jsem epyk ounr",
          "a teď budeme čelendžovat zákazníka",
          "domluvili jsme se na Follow up"
        ]
      },
      {
        "id": "attack",
        "label": "Útok",
        "lines": [
          "u zákazníka máte připraven cervenej koberec",
          "navrhuji další meeting na tohle téma",
          "nový scénář který budeme brousit do finalního diamantu",
          "valídní podpora projektu je zajištěna na verbální úrovni ",
          "ok, pošlu asi email"
        ]
      },
      {
        "id": "hit",
        "label": "Zásah",
        "lines": [
          "teď už jen doleštime ten diamant",
          "to je dobrej odrazovej můstek..."
        ]
      },
      {
        "id": "demand",
        "label": "Nová tabulka",
        "lines": [
          "Dycky DEMAND!",
          "Tak uděláme novou tabulku,ne?"
        ]
      },
      {
        "id": "defeat",
        "label": "Při porážce",
        "lines": [
          "išiel som viac iba po povrche"
        ]
      },
      {
        "id": "arrival",
        "label": "Druhý projekťák vystupuje z výtahu v 6. patře",
        "lines": [
          "projektaku není nikdy dost"
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
          "Fr fr.",
          "BRUH",
          "67",
          "nejsem labubu"
        ]
      }
    ]
  },
  {
    "id": "jay",
    "name": "SOJKA",
    "groups": [
      {
        "id": "ambient",
        "label": "Nad stromem na nádvoří",
        "lines": [
          "tjantumbejk!",
          "no,ale hlásit se to musí,",
          "pijé, tak já letím",
          "beeee"
        ]
      }
    ]
  },
  {
    "id": "jarda",
    "name": "DžejTý",
    "groups": [
      {
        "id": "roll",
        "label": "Po kotrmelci s kolem",
        "lines": [
          "to bylo v podstatě o fous."
        ]
      },
      {
        "id": "backflip",
        "label": "Po backflipu",
        "lines": [
          "příště jedu vlakem."
        ]
      },
      {
        "id": "superman",
        "label": "Po přeskočení a zásahu zezadu",
        "lines": [
          "Korpič blaznivej."
        ]
      }
    ]
  }
];
 window.ITHeroDialogue={characters,lines(id,group){const g=characters.find(c=>c.id===id)?.groups.find(g=>g.id===group);return [...(g?.lines||[]),...(window.ITHeroAppearance?.state.original?g?.originalLines||[]:[])];}};
})();
