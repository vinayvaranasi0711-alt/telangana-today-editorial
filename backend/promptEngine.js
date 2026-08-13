import dotenv from 'dotenv';
dotenv.config();

// Pre-defined high quality mock translations for Telangana Today templates
const MOCK_DATABASE = [
  {
    keywords: ['ghmc', 'park', 'clean', 'monday'],
    Standard: {
      telugu_translation: "వచ్చే సోమవారం నుండి మున్సిపల్ పార్కులను శుభ్రపరిచేందుకు గ్రేటర్ హైదరాబాద్ మున్సిపల్ కార్పొరేషన్ (GHMC) కొత్త డ్రైవ్‌ను ప్రకటించింది.",
      cultural_notes: [
        "Translated 'municipal parks' to 'మున్సిపల్ పార్కులు' which is standard in regional news reporting.",
        "Translated 'drive' to 'డ్రైవ్‌ను' or 'కార్యక్రమం' to maintain news register consistency."
      ]
    },
    Colloquial: {
      telugu_translation: "వచ్చే సోమవారం నుండి నగరంలోని పార్కులను సాఫ్ చేయడానికి జీహెచ్‌ఎంసీ (GHMC) ఒక కొత్త కార్యక్రమాన్ని మొదలుపెడుతోంది.",
      cultural_notes: [
        "Used 'సాఫ్ చేయడానికి' (clean up) which is highly colloquial in Deccani/Hyderabadi Telugu.",
        "Adjusted the sentence structure to read like a local community announcement."
      ]
    },
    Formal: {
      telugu_translation: "రాబోవు సోమవారము నుండి పురపాలక సంఘ ఉద్యానవనాలను శుద్ధి చేయుటకై గ్రేటర్ హైదరాబాద్ మున్సిపల్ కార్పొరేషన్ (GHMC) నూతన కార్యాచరణను ప్రకటించినది.",
      cultural_notes: [
        "Used high-register literary Telugu 'పురపాలక సంఘ ఉద్యానవనాలను' for 'municipal parks'.",
        "Used formal verb ending 'ప్రకటించినది' instead of the standard conversational format."
      ]
    }
  },
  {
    keywords: ['minister', 'irrigation', 'monsoon'],
    Standard: {
      telugu_translation: "వర్షాకాలానికి ముందే జిల్లాలో సాగునీటి ప్రాజెక్టులను పూర్తి చేస్తామని మంత్రి హామీ ఇచ్చారు.",
      cultural_notes: [
        "Translated 'irrigation projects' to 'సాగునీటి ప్రాజెక్టులు' - the standard administrative Telugu term.",
        "Used 'మంత్రి హామీ ఇచ్చారు' (minister assured) which is standard journalistic style."
      ]
    },
    Colloquial: {
      telugu_translation: "వర్షాలు పడక ముందే జిల్లాలో సాగునీటి ప్రాజెక్టుల పని అంతా కంప్లీట్ చేస్తామని మంత్రి నమ్మకం ఇచ్చారు.",
      cultural_notes: [
        "Used colloquial phrasing 'పని అంతా కంప్లీట్ చేస్తామని' for 'will be completed'.",
        "Adapted 'assured' to conversational 'నమ్మకం ఇచ్చారు'."
      ]
    },
    Formal: {
      telugu_translation: "వర్షాకాల ప్రారంభమునకు పూర్వమే సదరు జిల్లాలోని సాగునీటి ప్రాజెక్టులను సంపూర్ణం చేయగలమని గౌరవనీయులైన మంత్రి వర్యులు భరోసా ఇచ్చారు.",
      cultural_notes: [
        "Used highly respectful terms 'గౌరవనీయులైన మంత్రి వర్యులు' (Honorable Minister).",
        "Translated 'assured' to formal literary 'భరోసా ఇచ్చారు'."
      ]
    }
  },
  {
    keywords: ['bonalu', 'drums', 'old city'],
    Standard: {
      telugu_translation: "పాతబస్తీ వ్యాప్తంగా ప్రజలు బోనాల పండుగను సాంప్రదాయ డప్పు చప్పుళ్లు, ఎంతో ఉత్సాహంతో జరుపుకున్నారు.",
      cultural_notes: [
        "Translated 'old city' to 'పాతబస్తీ' which is the standard name used in regional news for Hyderabad's historical quarters.",
        "Used 'డప్పు చప్పుళ్లు' for 'traditional drums' to connect with local Telangana Bonalu terminology."
      ]
    },
    Colloquial: {
      telugu_translation: "పాతబస్తీ అంతటా బోనాల పండుగను డప్పుల మోతతో, పోతురాజుల డాన్సులతో జనాలు గట్టిగా జరుపుకున్నారు.",
      cultural_notes: [
        "Used local terms 'డప్పుల మోతతో' and 'పోతురాజులు' representing cultural nuances of Bonalu.",
        "Adapted 'people celebrated' to colloquial 'జనాలు గట్టిగా జరుపుకున్నారు'."
      ]
    },
    Formal: {
      telugu_translation: "చారిత్రాత్మక పాతనగరంలో సాంప్రదాయ వాయిద్యాలు, మంగళ హారతుల నడుమ భక్తులు బోనాల మహోత్సవాన్ని అత్యంత వైభవంగా జరుపుకున్నారు.",
      cultural_notes: [
        "Used 'భక్తులు బోనాల మహోత్సవాన్ని' (devotees Bonalu grand festival) reflecting formal cultural respect.",
        "Translated 'traditional drums' to formal 'సాంప్రదాయ వాయిద్యాలు'."
      ]
    }
  },
  {
    keywords: ['hyderabad fc', 'clinched', 'victory', 'minutes'],
    Standard: {
      telugu_translation: "హైదరాబాద్ ఎఫ్‌సి మ్యాచ్ చివరి నిమిషంలో నాటకీయ విజయాన్ని కైవసం చేసుకుంది.",
      cultural_notes: [
        "Used active voice phrasing 'విజయాన్ని కైవసం చేసుకుంది' which is standard in regional sports reporting.",
        "Translated 'final minutes' to 'చివరి నిమిషంలో' for natural news flow."
      ]
    },
    Colloquial: {
      telugu_translation: "మ్యాచ్ చివరి నిమిషాల్లో హైదరాబాద్ ఎఫ్‌సి అదిరిపోయే గెలుపును కొట్టింది.",
      cultural_notes: [
        "Used colloquial phrasing 'అదిరిపోయే గెలుపును కొట్టింది' (clinched an awesome win) for higher audience excitement.",
        "Adapted 'clinched a dramatic victory' to local reader style."
      ]
    },
    Formal: {
      telugu_translation: "హైదరాబాద్ ఎఫ్‌సి మ్యాచ్ తదుపరి చరమ క్షణాలలో అద్భుతమైన విజయాన్ని సొంతం చేసుకున్నది.",
      cultural_notes: [
        "Used high-register Telugu vocabulary 'చరమ క్షణాలలో' (final moments).",
        "Used formal verb ending 'సొంతం చేసుకున్నది'."
      ]
    }
  }
];

function applyRegionalAdaptation(translation, tone, dialect) {
  let text = translation;
  
  if (dialect === 'Warangal' && tone === 'Colloquial') {
    // Apply Telangana/Warangal verb adaptations
    text = text.replace(/అవుతుంది/g, "అయితాంది");
    text = text.replace(/చేస్తుంది/g, "చేస్తాంది");
    text = text.replace(/చేస్తున్నారు/g, "చేస్తాండ్రు");
    text = text.replace(/వెళ్తున్నారు/g, "పోతాండ్రు");
    text = text.replace(/వస్తుంది/g, "వస్తాంది");
    text = text.replace(/వస్తున్నారు/g, "వస్తాండ్రు");
    text = text.replace(/ఉంది/g, "ఉన్నది");
    text = text.replace(/ఉన్నారు/g, "ఉండ్రు");
    text = text.replace(/చెప్పారు/g, "చెప్పిండ్రు");
    text = text.replace(/చేశారు/g, "చేసిండ్రు");
    text = text.replace(/వెళ్లారు/g, "పోయిండ్రు");
    text = text.replace(/ప్రకటించారు/g, "ప్రకటించిండ్రు");
    text = text.replace(/అన్నారు/g, "అనిండ్రు");
    
    // Add regional dialect ending if not already present
    if (!text.includes("సాయిన్")) {
      text = text.replace(/(\.|\?|!)$/, " సాయిన్$1");
    }
  } 
  else if (dialect === 'Hyderabadi' && tone === 'Colloquial') {
    // Apply Hyderabadi/Deccani adjustments
    text = text.replace(/త్వరగా/g, "జల్దీ");
    text = text.replace(/తొందరగా/g, "జల్దీ");
    text = text.replace(/శుభ్రం/g, "సాఫ్");
    text = text.replace(/పరిశుభ్రం/g, "సాఫ్");
    
    // Add Hyderabadi ending if not already present
    if (!text.includes("బాయ్")) {
      text = text.replace(/(\.|\?|!)$/, " బాయ్$1");
    }
  }
  
  return text;
}

async function getMockTranslation(english, tone, dialect, regenerate = false) {
  const lowercaseInput = english.toLowerCase();
  
  // Find a matching template in mock database
  const match = MOCK_DATABASE.find(item => 
    item.keywords.every(keyword => lowercaseInput.includes(keyword))
  );

  if (match) {
    const data = match[tone] || match.Standard;
    // Inject dialect specific tweaks if needed
    let translation = data.telugu_translation;
    let notes = [...data.cultural_notes];

    if (dialect === 'Hyderabadi' && tone === 'Colloquial') {
      translation = translation.replace("మొదలుపెడుతోంది", "మొదలుపెడ్తాంది బాయ్");
      notes.push("Added Hyderabadi Deccani ending 'బాయ్' for colloquial character.");
    } else if (dialect === 'Warangal' && tone === 'Colloquial') {
      translation = translation.replace("మొదలుపెడుతోంది", "మొదలు పెడ్తాంది సాయిన్");
      notes.push("Added Warangal/Telangana accent marker 'సాయిన్' for local connection.");
    }

    if (regenerate) {
      translation = translation.replace("ప్రకటించింది.", "అధికారికంగా వెల్లడించింది.");
      translation = translation.replace("హామీ ఇచ్చారు.", "స్పష్టం చేస్తూ భరోసానిచ్చారు.");
      translation = translation.replace("జరుపుకున్నారు.", "వైభవంగా నిర్వహించుకున్నారు.");
      notes.push("Regenerated: Provided alternative news verbs for phrasing variation.");
    }

    return {
      telugu_translation: translation,
      cultural_notes: notes
    };
  }

  // Fallback for custom text: Call Google's free translation service to get a REAL translation
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=te&dt=t&q=${encodeURIComponent(english)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Translate API returned status ${response.status}`);
    }
    const json = await response.json();
    if (json && json[0]) {
      const realTranslation = json[0].map(item => item[0]).join('');
      
      // Apply regional slang adaptations
      const adaptedTranslation = applyRegionalAdaptation(realTranslation, tone, dialect);
      
      const toneDesc = tone === 'Colloquial' ? 'సహజసిద్ధమైన వాడుక' : (tone === 'Formal' ? 'గ్రాంథిక/ఆధికారిక' : 'ప్రామాణిక వార్తా');
      const dialectDesc = dialect !== 'Standard' ? `${dialect} ప్రాంతీయ మాండలికం` : 'ప్రామాణిక';
      
      let notes = [
        `Real-time English-to-Telugu translation completed successfully.`,
        `Selected tone: ${toneDesc}. Selected dialect: ${dialectDesc}.`
      ];

      if (dialect === 'Hyderabadi' && tone === 'Colloquial') {
        notes.push("Adapted text with Hyderabadi Deccani vocabulary (e.g. 'సాఫ్', 'జల్దీ') and 'బాయ్' endings.");
      } else if (dialect === 'Warangal' && tone === 'Colloquial') {
        notes.push("Adapted standard Telugu verbs to Telangana regional endings (e.g., 'అయితాంది', 'చేస్తాండ్రు') and 'సాయిన్' endings.");
      }
      
      notes.push("Configure a GEMINI_API_KEY in the backend .env file to enable advanced AI-driven contextual localization.");
      
      return {
        telugu_translation: adaptedTranslation,
        cultural_notes: notes
      };
    }
  } catch (error) {
    console.error("Free Google Translate API failed, falling back to local simulation:", error.message);
  }

  // Double fallback if Google Translate fails (e.g. offline)
  const toneDesc = tone === 'Colloquial' ? 'సహజసిద్ధమైన వాడుక' : (tone === 'Formal' ? 'గ్రాంథిక/ఆధికారిక' : 'ప్రామాణిక వార్తా');
  const dialectDesc = dialect !== 'Standard' ? `${dialect} ప్రాంతీయ మాండలికం` : 'ప్రామాణిక';
  
  let translation = `[Mock Telugu Translation] ${english.split(' ').reverse().join(' ')} (అనువాదం: ${toneDesc} శైలి, ${dialectDesc} మాండలికంలో - API కీ అందుబాటులో లేదు)`;
  let notes = [
    `Localized the text to Telugu using a ${toneDesc} tone.`,
    `Adapted phrasing to match the ${dialectDesc} style rules.`,
    "Configure a valid GEMINI_API_KEY in the backend .env file to enable live translation."
  ];

  return {
    telugu_translation: translation,
    cultural_notes: notes
  };
}

export async function generateLocalisedTranslation({ journalist, inputs, english, tone = 'Standard', dialect = 'Standard', regenerate = false }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE' || apiKey === 'your_gemini_api_key_here') {
    console.log(`[INFO] Running in local Mock Mode. Request params: Tone=${tone}, Dialect=${dialect}, Regenerate=${regenerate}`);
    return await getMockTranslation(english, tone, dialect, regenerate);
  }

  // Construct structured Prompt v4
  const systemPrompt = `You are an expert bilingual Senior Editor and Localisation specialist at "Telangana Today" (telanganatoday.com).
Your task is to translate and adapt the English news story draft into a culturally resonant, grammatically perfect Telugu translation that connects deeply with local readers.

Follow these strict rules (Prompt v4 rules):
1. TONE: Adapt the translation using the requested tone (${tone}):
   - Standard: Clean, editorial, grammatically formal.
   - Colloquial: Uses common local expressions, idioms, and conversational phrasing.
   - Formal: High-level literary Telugu.
2. DIALECT: Incorporate regional vocabulary based on the specified dialect (${dialect}):
   - Hyderabadi: Blend in familiar Urdu/Deccani-influenced words where appropriate (e.g. for civic updates like using 'సాఫ్' or 'జల్దీ').
   - Warangal: Use standard regional Telangana Telugu expressions (e.g. using 'సాయిన్' or Telangana-specific verbs and pronouns).
   - Standard: General news-standard Telugu.
3. ACTIVE VOICE: Always prefer active voice structures over passive voice structures in Telugu. (e.g., instead of "The park was cleaned by workers", use "కార్మికులు పార్కును శుభ్రపరిచారు").
4. IDIOMS & PHRASING: Avoid literal translations of English idioms. Translate them into equivalent natural Telugu idioms. (e.g., "at the eleventh hour" -> "చివరి నిమిషంలో"; "left no stone unturned" -> "శాయశక్తులా ప్రయత్నించారు"; "clenched victory" -> "విజయాన్ని కైవసం చేసుకుంది").
5. MEDIA JARGON: Translate terms properly (e.g., "Minister launched scheme" should use localized terms like "ప్రారంభించారు" or "శంకుస్థాపన చేశారు" as fits).
6. FORMAT: You must return the output EXACTLY in the following JSON format. Do not wrap the JSON in markdown code blocks like \`\`\`json ... \`\`\`. Just return the raw JSON object string:
{
  "telugu_translation": "The localized Telugu news story",
  "cultural_notes": [
    "Point 1 explaining why a certain word/phrase was localized for regional reader connection",
    "Point 2 explaining the dialect-specific word choices made"
  ]
}`;

  let userPrompt = `User Inputs:
- Journalist Name: ${journalist}
- Additional Guidelines/Context: ${inputs || 'None provided'}
- English Story Draft:
${english}`;

  if (regenerate) {
    userPrompt += `\n\n[INSTRUCTION: This is a REGENERATION request. Please provide a slightly different translation phrasing variation from normal translations (e.g. alternative synonyms or sentence order), while maintaining strict accuracy and the requested tone/dialect.]`;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: systemPrompt },
              { text: userPrompt }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: regenerate ? 0.7 : 0.3
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API returned error code ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!candidateText) {
      throw new Error("Empty response from Gemini API candidates.");
    }

    // Parse output JSON
    const parsedOutput = JSON.parse(candidateText.trim());
    
    if (!parsedOutput.telugu_translation) {
      throw new Error("Invalid output format: Missing telugu_translation field.");
    }

    return {
      telugu_translation: parsedOutput.telugu_translation,
      cultural_notes: parsedOutput.cultural_notes || []
    };

  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    throw error;
  }
}
