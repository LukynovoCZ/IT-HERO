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
          "Jdeš nastavit přístupová hesla ke kávě zdarma pro kolegu Jimma. Každý nápoj musí mít jiné heslo a dvoufázové ověření.",
          "Čeká tě rychlá porada o tom, proč jsou porady příliš dlouhé. Rezervováno do pátku.",
          "Byl jsi jmenován koordinátorem přechodu z disket na diskety s vyšší kapacitou.",
          "Jdeš ručně inventarizovat cloud. Žebřík si vyzvedni na recepci.",
          "Musíš obnovit smazanou prezentaci o důležitosti zálohování. Záloha neexistuje.",
          "Dostal jsi za úkol opravit výtahy. Přístupová karta je v devátém patře.",
          "Jdeš schválit žádost o přístup k formuláři pro podání žádosti o přístup.",
          "Povinný brainstorming právě začíná. Téma: Jak dostat ajťáky zpátky do práce."
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
          "ÁÁÁÁ!"
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
          "Ukaž mi kartičku."
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
          "DUP! DUP!"
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
          "Neviděli jste tu Laca?"
        ]
      },
      {
        "id": "hotdog",
        "label": "Nabídka párku",
        "lines": [
          "Srát na tousty, dej si párek!",
          "Teplej páreka a studená němka. nebo tak nějak to bylo."
        ]
      },
      {
        "id": "peek",
        "label": "Vykouknutí a odchod",
        "lines": [
          "Hele…ryba",
          "a ten stál a čuměl."
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
    "groups": []
  },
  {
    "id": "hr_manager",
    "name": "HR MANAŽERKA",
    "groups": []
  },
  {
    "id": "design_manager",
    "name": "MANAŽER DESIGNU",
    "groups": []
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
          "Dáš si restart v kelímku?",
          "Nejdřív kafe. Pak zachraňuj svět."
        ]
      },
      {
        "id": "candy",
        "label": "Nabídka Sisinky",
        "lines": [
          "Sisinka. Hotfix na náladu.",
          "Malá záloha energie na cestu."
        ]
      }
    ]
  },
  {
    "id": "old_badger",
    "name": "STARÝ JEZEVEC",
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
  }
];
 window.ITHeroDialogue={characters,lines(id,group){return characters.find(c=>c.id===id)?.groups.find(g=>g.id===group)?.lines || [];}};
})();
