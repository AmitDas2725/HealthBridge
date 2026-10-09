import { useState } from "react";
import { requestAi } from "../services/api";

export default function ChatbotPanel({ onApplyRecommendedDoctor }) {
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      const response = await requestAi({ symptoms });
      setResult(response.data);
    } catch (error) {
      setResult({
        guidance: error.message,
        recommendedDoctor: "General Physician",
        possibleConditions: ["Unable to process symptoms"],
        medicinesToDiscuss: ["No medicine guidance available right now"],
        advice: ["Please try again after checking that the AI provider API key is configured."],
        followUpQuestion: "Can you share the symptom again in simpler words if the problem continues?",
        disclaimer: "Consult a qualified doctor for confirmation."
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel chatbot-panel">
      <div className="section-title">
        <span className="eyebrow">AI Symptom Checker</span>
        <h2>Describe symptoms and get the right doctor type</h2>
      </div>

      <textarea
        rows={6}
        value={symptoms}
        onChange={(event) => setSymptoms(event.target.value)}
        placeholder="Example: I have stomach pain, acidity, bloating after meals, and mild nausea for 2 days."
      />

      <div className="action-row">
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Checking..." : "Check Symptoms"}
        </button>

        {result?.recommendedDoctor ? (
          <button
            className="secondary-button"
            onClick={() => onApplyRecommendedDoctor(result.recommendedDoctor)}
          >
            Find Nearby Doctors
          </button>
        ) : null}
      </div>

      {result ? (
        <div className="ai-result">
          <pre>{result.guidance}</pre>
        </div>
      ) : null}
    </section>
  );
}
