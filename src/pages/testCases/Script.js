export const CALL_FLOW_SCRIPT = `### Call Flow

**[Phone Rings]**

**SARAH:** "Hello?"

---

**[After agent greeting and purpose]**

**SARAH:** "Sure, I have a few minutes. What's this about?"

---

**[Vehicle confirmation]**

**SARAH:** "Yes, absolutely! I love that car."

---

**[Mileage question]**

**SARAH:** *[pause 1.5s]* "Um, let me think... I believe it's around 32,000 miles. Yeah, about 32,000."

---

**[Last service question]**

**SARAH:** *[pause 1s]* "I think it was about four months ago? I got an oil change and tire rotation."

---

**[Satisfaction rating]**

**SARAH:** "Oh, I'd definitely say a 9. The car runs beautifully, and your service team is always so helpful."

---

**[Future plans question]**

**SARAH:** "Oh no, I'm definitely keeping it. It's perfect for my needs right now."

---

**[During offer presentation - listening]**

**SARAH:** "Oh? What does that include?"

---

**[After full offer details]**

**SARAH:** *[pause 2.5s, typing sounds]* "Wow, that actually sounds like a really good deal. I was going to need those oil changes anyway..."

---

**[Clarifying question]**

**SARAH:** "That makes sense. And this is good for a full year?"

---

**[After confirmation]**

**SARAH:** *[pause 1s]* "Okay, you know what? I think I'd like to do this. How do we get started?"

---

**[Scheduling appointment]**

**SARAH:** "Let me check my calendar real quick..." *[pause 3s, typing/clicking sounds]* "Do you have anything available next Wednesday afternoon?"

---

**[After time confirmation]**

**SARAH:** "Perfect! That works great."

---

**[Email request]**

**SARAH:** "It's sarah.martinez@email.com"

---

**[After agent confirms email]**

**SARAH:** "Great, thank you so much!"

---

**[Final goodbye]**

**SARAH:** "You too, Jessica. Thanks again! Bye!"

---`

export const EXPECTED_RESPONSE = `The agent should successfully:
1. Greet the customer warmly and confirm they have time
2. Verify vehicle details conversationally
3. Gather key information (mileage, service history, satisfaction, future plans)
4. Present the appropriate offer based on customer responses
5. Handle any questions or concerns
6. Schedule an appointment and capture email
7. End the call on a positive note`

// Default test cases (fallback if no testSuite provided)
export const DEFAULT_TESTS_CASES = [
  {
    id: 1,
    title: "Happy Customer - Service Package Success",
    icon: "⭐",
    persona: {
      gender: "Female",
      name: "Sarah Martinez",
      speakingRate: "Moderate (120-130 WPM)",
      interruptionTendency: "Low (waits for pauses)",
      dialect: "Standard American English (West Coast)",
      personality: "Friendly, engaged, asks clarifying questions",
      backgroundEnvironment: "Quiet home office, occasional keyboard typing",
      vehicle: "2021 Honda CR-V",
      currentSituation: "Happy with vehicle, regular service customer"
    }
  },
  {
    id: 2,
    title: "Upgrade Seeker - Trade-In Success",
    persona: {
      gender: "Male",
      name: "Michael Chen",
      speakingRate: "Fast (150-160 WPM)",
      interruptionTendency: "Medium (occasionally finishes sentences)",
      dialect: "Standard American English (slight Northeast accent)",
      personality: "Decisive, business-like, efficiency-focused",
      backgroundEnvironment: "Car interior (driving), occasional turn signal sounds",
      vehicle: "2019 Toyota Camry with 78,000 miles",
      currentSituation: "Considering upgrade, interested in newer models"
    }
  },
  {
    id: 3,
    title: "Skeptical Customer - Objection Handling",
    persona: {
      gender: "Female",
      name: "Patricia Thompson",
      speakingRate: "Slow-Moderate (100-110 WPM)",
      dialect: "Southern American English (Georgia/Alabama)",
      interruptionTendency: "Low",
      personality: "Skeptical, price-sensitive, needs convincing",
      backgroundEnvironment: "Quiet, occasional TV in background",
      vehicle: "2020 Ford F-150",
      currentSituation: "Uses independent mechanic, budget-conscious"
    }
  },
  {
    id: 4,
    title: "Busy Customer - Callback Request",
    persona: {
      gender: "Male",
      name: "David Kumar",
      speakingRate: "Very Fast (160-170 WPM)",
      interruptionTendency: "High (frequently interrupts)",
      dialect: "Standard American English with slight Indian accent",
      personality: "Rushed, stressed, multitasking",
      backgroundEnvironment: "Office environment (meetings in background, phone ringing)",
      vehicle: "2022 Tesla Model 3",
      currentSituation: "In the middle of work, genuinely busy"
    }
  },
  {
    id: 5,
    title: "Satisfied Referrer - Referral Program Success",
    persona: {
      gender: "Female",
      name: "Jennifer Williams",
      speakingRate: "Moderate-Fast (140 WPM)",
      interruptionTendency: "Low-Medium",
      dialect: "Midwest American English",
      personality: "Enthusiastic, loyal customer, socially connected",
      backgroundEnvironment: "Quiet home, occasional dog barking",
      vehicle: "2021 Lexus RX 350",
      currentSituation: "Very satisfied (10/10), has friends looking for cars"
    }
  },
  {
    id: 6,
    title: "Indecisive Customer - \"Need to Think\" Handling",
    persona: {
      gender: "Male",
      name: "Robert (Bob) Anderson",
      speakingRate: "Slow (90-100 WPM)",
      interruptionTendency: "None (very polite)",
      dialect: "Upper Midwest English (Minnesota/Wisconsin)",
      personality: "Cautious, needs to consult spouse, detail-oriented",
      backgroundEnvironment: "Quiet, suburban home",
      vehicle: "2020 Subaru Outback",
      currentSituation: "Generally happy but makes joint decisions"
    }
  },
  {
    id: 7,
    title: "Do Not Call Request - Compliance Test",
    persona: {
      gender: "Female",
      name: "Lisa Rodriguez",
      speakingRate: "Fast (155 WPM)",
      interruptionTendency: "High (cuts in immediately)",
      dialect: "Standard American English",
      personality: "Direct, firm, slightly irritated",
      backgroundEnvironment: "Quiet",
      vehicle: "2021 Nissan Altima",
      currentSituation: "Doesn't want marketing calls"
    }
  },
  {
    id: 8,
    title: "Service-Loyal Customer - Competitor Comparison",
    persona: {
      gender: "Male",
      name: "James Morrison",
      speakingRate: "Moderate (125 WPM)",
      interruptionTendency: "Low",
      dialect: "Southern American English (Texas)",
      personality: "Loyal to current mechanic, friendly but firm",
      backgroundEnvironment: "Home garage (tools, radio playing country music)",
      vehicle: "2018 Chevrolet Silverado",
      currentSituation: "Happy with independent shop, needs convincing"
    }
  },
  {
    id: 9,
    title: "Technical Difficulties - Poor Connection",
    persona: {
      gender: "Female",
      name: "Amanda Foster",
      speakingRate: "Moderate but with breaks",
      interruptionTendency: "None (connection issues cause gaps)",
      dialect: "Standard American English",
      personality: "Patient but frustrated with connection",
      backgroundEnvironment: "Poor cell coverage, frequent audio drops, static",
      vehicle: "2020 Mazda CX-5",
      currentSituation: "Interested but connection makes it difficult"
    }
  },
  {
    id: 10,
    title: "High-Mileage Owner - Service Package Perfect Fit",
    persona: {
      gender: "Male",
      name: "Thomas (Tom) Green",
      speakingRate: "Slow-Moderate (110 WPM)",
      interruptionTendency: "Medium (asks many questions)",
      dialect: "Northeast American English (Boston area)",
      personality: "Practical, analytical, value-conscious",
      backgroundEnvironment: "Home office, occasional family noise (kids)",
      vehicle: "2017 Honda Accord with 95,000 miles",
      currentSituation: "Plans to keep car long-term, maintenance-focused"
    }
  }
]
