export const TRANSCRIPT_STEPS_DUMMY = {
  "test_id": "edge_case_unexpected_responses",
  "session_id": "sim_1734095431000",
  "start_time": 1734095431000,
  "end_time": 1734095493800,
  "status": "completed",
  "steps": [
    {
      "kind": "agent_speak",
      "text": "Hello, am I speaking with Mr. Aditya?",
      "confidence": 0.95,
      "timestamp": 1734095431000,
      "audio_path": "output/audio/agent_turn_0.wav",
      "response_latency_ms": 1200,
      "ttft_ms": 300,
      "ttct_ms": 800,
      "validation_criteria": [
        "Agent should introduce themselves professionally",
        "Agent should confirm the customer's identity"
      ],
      "expected_keywords": ["Aditya", "speaking"]
    },
    {
      "kind": "user_speak",
      "text": "Who's calling?",
      "timestamp": 1734095434500,
      "audio_path": "output/audio/user_turn_1.wav"
    },
    {
      "kind": "agent_speak",
      "text": "Hi Mr. Aditya, this is Priya calling from Greentech Realtors, Bengaluru. You had recently shown interest in one of our properties listed on 99Acres. Would this be a good time to have a quick 2-minute chat to understand your requirements better?",
      "confidence": 0.92,
      "timestamp": 1734095436200,
      "audio_path": "output/audio/agent_turn_1.wav",
      "response_latency_ms": 1700,
      "ttft_ms": 400,
      "ttct_ms": 950,
      "validation_criteria": [
        "Agent should clearly state company name",
        "Agent should mention the lead source (99Acres)",
        "Agent should ask for permission to continue the call"
      ],
      "expected_keywords": ["Greentech Realtors", "interest", "properties", "99Acres"]
    },
    {
      "kind": "user_speak",
      "text": "Okay, yes, I remember. Go ahead.",
      "timestamp": 1734095442000,
      "audio_path": "output/audio/user_turn_2.wav"
    },
    {
      "kind": "agent_speak",
      "text": "Great. I see you've been exploring options on Sarjapur Road. Would you like me to focus only on that area, or are you open to nearby locations as well?",
      "confidence": 0.94,
      "timestamp": 1734095443800,
      "audio_path": "output/audio/agent_turn_2.wav",
      "response_latency_ms": 1800,
      "ttft_ms": 450,
      "ttct_ms": 980,
      "validation_criteria": [
        "Agent should confirm location preference",
        "Agent should offer flexibility with nearby areas"
      ],
      "expected_keywords": ["Sarjapur Road", "location", "nearby"]
    },
    {
      "kind": "user_speak",
      "text": "Yes, Sarjapur Road would be perfect.",
      "timestamp": 1734095448500,
      "audio_path": "output/audio/user_turn_3.wav"
    },
    {
      "kind": "agent_speak",
      "text": "Perfect. We have some excellent projects in that area. Are you looking for a 2 BHK, 3 BHK, or something larger?",
      "confidence": 0.91,
      "timestamp": 1734095450100,
      "audio_path": "output/audio/agent_turn_3.wav",
      "response_latency_ms": 1600,
      "ttft_ms": 380,
      "ttct_ms": 920,
      "validation_criteria": [
        "Agent should inquire about property configuration",
        "Agent should provide specific options (2 BHK, 3 BHK)"
      ],
      "expected_keywords": ["2 BHK", "3 BHK", "configuration"]
    },
    {
      "kind": "user_speak",
      "text": "I'm looking for a 3 BHK apartment.",
      "timestamp": 1734095454000,
      "audio_path": "output/audio/user_turn_4.wav"
    },
    {
      "kind": "agent_speak",
      "text": "Great choice. When are you planning to move in? We have both ready-to-move-in properties and under-construction projects.",
      "confidence": 0.93,
      "timestamp": 1734095455700,
      "audio_path": "output/audio/agent_turn_4.wav",
      "response_latency_ms": 1700,
      "ttft_ms": 420,
      "ttct_ms": 960,
      "validation_criteria": [
        "Agent should inquire about possession timeline",
        "Agent should clarify if looking for ready-to-move or under-construction"
      ],
      "expected_keywords": ["move in", "timeline", "ready-to-move", "under-construction"]
    },
    {
      "kind": "user_speak",
      "text": "I can move in within 3 months.",
      "timestamp": 1734095460500,
      "audio_path": "output/audio/user_turn_5.wav"
    },
    {
      "kind": "agent_speak",
      "text": "Got it. And what is your budget range for this purchase?",
      "confidence": 0.90,
      "timestamp": 1734095462000,
      "audio_path": "output/audio/agent_turn_5.wav",
      "response_latency_ms": 1500,
      "ttft_ms": 350,
      "ttct_ms": 900,
      "validation_criteria": [
        "Agent should ask for budget"
      ],
      "expected_keywords": ["budget", "price"]
    },
    {
      "kind": "user_speak",
      "text": "Around 1.5 Crores.",
      "timestamp": 1734095465500,
      "audio_path": "output/audio/user_turn_6.wav"
    },
    {
      "kind": "agent_speak",
      "text": "Noted. I have a few properties that match your criteria. Can we schedule a site visit for this weekend?",
      "confidence": 0.96,
      "timestamp": 1734095467200,
      "audio_path": "output/audio/agent_turn_6.wav",
      "response_latency_ms": 1700,
      "ttft_ms": 400,
      "ttct_ms": 940,
      "validation_criteria": [
        "Agent should propose a site visit",
        "Agent should suggest a specific time/day"
      ],
      "expected_keywords": ["site visit", "weekend", "schedule"]
    },
    {
      "kind": "user_speak",
      "text": "Sure, Saturday works.",
      "timestamp": 1734095471000,
      "audio_path": "output/audio/user_turn_7.wav"
    },
    {
      "kind": "agent_speak",
      "text": "Excellent. I'll send you the details on WhatsApp. Thank you for your time, Mr. Aditya. Have a great day.",
      "confidence": 0.98,
      "timestamp": 1734095473500,
      "audio_path": "output/audio/agent_turn_7.wav",
      "response_latency_ms": 1200,
      "ttft_ms": 300,
      "ttct_ms": 800,
      "validation_criteria": [
        "Agent should confirm next steps (WhatsApp)",
        "Agent should close the call professionally"
      ],
      "expected_keywords": ["WhatsApp", "Thank you", "great day"]
    },
    {
      "kind": "user_speak",
      "text": "Thank you, bye.",
      "timestamp": 1734095478000,
      "audio_path": "output/audio/user_turn_8.wav"
    }
  ]
};
