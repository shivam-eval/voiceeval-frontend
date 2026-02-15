const fs = require("fs");
const path = "src/pages/testCases/TestCasesScreen.jsx";
let content = fs.readFileSync(path, "utf8");

const oldSteps = `    steps: [
      {
        turn_number: 1,
        kind: "agent_speak",
        text: "Hello, I'm Riya calling on behalf of ABC Finance. This call is regarding an outstanding payment. May I confirm if I'm speaking with Rajesh?",
        turn_id: "turn_001",
        turn_role: "agent",
        node_id: "start"
      },
      {
        turn_number: 2,
        kind: "user_speak",
        text: "Yes, this is Rajesh.",
        turn_id: "turn_002",
        turn_role: "user",
        node_id: "identity_confirmed"
      },
      {
        turn_number: 3,
        kind: "agent_speak",
        text: "Thank you for confirming. There is an outstanding amount of ₹8,500 that was due on 10th December.",
        turn_id: "turn_003",
        turn_role: "agent",
        node_id: "identity_confirmed"
      },
      {
        turn_number: 4,
        kind: "user_speak",
        text: "Okay, I can make the payment today.",
        turn_id: "turn_004",
        turn_role: "user",
        node_id: "borrower_reaction"
      },
      {
        turn_number: 5,
        kind: "agent_speak",
        text: "Thank you. Would you like to pay now through a UPI link, or should I schedule a callback?",
        turn_id: "turn_005",
        turn_role: "agent",
        node_id: "can_pay_today"
      }
    ],
    metadata: {
      total_turns: 5,
      agent_turns: 3,
      user_turns: 2,
      duration_ms: 64000
    }`;

const newSteps = `    steps: [
      {
        turn_number: 1,
        kind: "agent_speak",
        text: "Hello, I'm Riya calling on behalf of ABC Finance. This call is regarding an outstanding payment. May I confirm if I'm speaking with Rajesh? This call may be recorded for service and compliance purposes.",
        turn_id: "turn_001",
        turn_role: "agent",
        node_id: "start"
      },
      {
        turn_number: 2,
        kind: "user_speak",
        text: "Yes, this is Rajesh.",
        turn_id: "turn_002",
        turn_role: "user",
        node_id: "identity_confirmed"
      },
      {
        turn_number: 3,
        kind: "agent_speak",
        text: "Thank you for confirming, Rajesh. I am calling to inform you that there is an outstanding amount of ₹8,500 on your personal loan account. The payment was due on 10th December. There are no additional penalties beyond what is mentioned in your loan agreement.",
        turn_id: "turn_003",
        turn_role: "agent",
        node_id: "dues_information"
      },
      {
        turn_number: 4,
        kind: "user_speak",
        text: "Okay, thanks for informing me.",
        turn_id: "turn_004",
        turn_role: "user",
        node_id: "borrower_acknowledgement"
      },
      {
        turn_number: 5,
        kind: "agent_speak",
        text: "You're welcome. Would you like to make the repayment today, or would you prefer to schedule it for another date?",
        turn_id: "turn_005",
        turn_role: "agent",
        node_id: "repayment_attempt"
      },
      {
        turn_number: 6,
        kind: "user_speak",
        text: "Yes, I can make the payment today.",
        turn_id: "turn_006",
        turn_role: "user",
        node_id: "can_pay_today"
      },
      {
        turn_number: 7,
        kind: "agent_speak",
        text: "Thank you. Would you like to pay now through a UPI link, or should I schedule a call back when you are ready?",
        turn_id: "turn_007",
        turn_role: "agent",
        node_id: "payment_method_offer"
      },
      {
        turn_number: 8,
        kind: "user_speak",
        text: "You can send me a UPI link. I will pay now.",
        turn_id: "turn_008",
        turn_role: "user",
        node_id: "payment_method_selected"
      },
      {
        turn_number: 9,
        kind: "agent_speak",
        text: "Sure. I am sending a secure UPI payment link to your registered mobile number. Please let me know once the payment is completed.",
        turn_id: "turn_009",
        turn_role: "agent",
        node_id: "payment_link_sent"
      },
      {
        turn_number: 10,
        kind: "user_speak",
        text: "Yes, I have completed the payment.",
        turn_id: "turn_010",
        turn_role: "user",
        node_id: "payment_done"
      },
      {
        turn_number: 11,
        kind: "agent_speak",
        text: "Thank you. I am checking the system for confirmation. Yes, I can see the payment of ₹8,500 has been received successfully.",
        turn_id: "turn_011",
        turn_role: "agent",
        node_id: "payment_verified"
      },
      {
        turn_number: 12,
        kind: "user_speak",
        text: "Great, thanks.",
        turn_id: "turn_012",
        turn_role: "user",
        node_id: "call_wrap_user"
      },
      {
        turn_number: 13,
        kind: "agent_speak",
        text: "Thank you for your time. I appreciate your patience. I will update the system with our discussion. Have a good day.",
        turn_id: "turn_013",
        turn_role: "agent",
        node_id: "closing"
      }
    ],
    metadata: {
      total_turns: 13,
      agent_turns: 7,
      user_turns: 6,
      duration_ms: 124000
    }`;

content = fs.readFileSync(path, "utf8");
const oldNorm = oldSteps.replace(/\u2019/g, "'");
const contentNorm = content.replace(/\u2019/g, "'");
const i = contentNorm.indexOf(oldNorm);
if (i === -1) {
  console.error("Block not found");
  process.exit(1);
}
const out = contentNorm.slice(0, i) + newSteps + contentNorm.slice(i + oldNorm.length);
fs.writeFileSync(path, out);
console.log("Done");
