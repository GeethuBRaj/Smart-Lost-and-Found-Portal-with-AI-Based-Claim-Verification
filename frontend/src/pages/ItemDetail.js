import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../api';

// Only used as emergency fallback if DB has no questions
function fallbackQuestions(item) {
  const n = item.name;
  const cat = item.category;
  const loc = item.location;

  if (cat === 'Electronics') return [
    `What is the exact brand and model of the ${n}?`,
    `Describe the colour and any case or cover on it.`,
    `Any scratches, stickers or damage on the ${n}?`,
    `What was the last thing you did on the ${n}?`,
    `Where exactly did you last have it before losing it at ${loc}?`
  ];
  if (cat === 'Bags') return [
    `What is the brand, colour and size of the bag?`,
    `List everything that was inside the bag when lost.`,
    `Any keychains, tags or badges on the outside?`,
    `Any damage, tears or broken zips on it?`,
    `Where were you coming from when you lost it near ${loc}?`
  ];
  if (cat === 'ID/Cards') return [
    `What full name is on the card?`,
    `What ID or roll number is on it?`,
    `Which institution issued it?`,
    `What is the expiry date if any?`,
    `What else was with the card when lost?`
  ];
  if (cat === 'Keys') return [
    `How many keys are on the keychain?`,
    `What does each key open?`,
    `Describe any keychain tag or charm.`,
    `What colour are the keys?`,
    `Where did you last use them before losing near ${loc}?`
  ];
  if (cat === 'Jewellery') return [
    `What type of jewellery is it?`,
    `What is it made of — gold, silver, beads?`,
    `Describe any design, stone or engraving on it.`,
    `Is it a gift? If yes from whom and when?`,
    `Where on campus did you notice it missing?`
  ];
  if (cat === 'Books') return [
    `Full title and author of the book?`,
    `Is your name written inside? Where?`,
    `What page were you last reading?`,
    `Any notes, highlights or bookmarks inside?`,
    `Describe the cover condition and any damage.`
  ];
  return [
    `Describe the exact colour and size of the ${n}.`,
    `Any unique marks, scratches or engravings on it?`,
    `Where exactly were you when you last had it?`,
    `How long have you owned this ${n}?`,
    `Was anything else lost with it near ${loc}?`
  ];
}

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimMode, setClaimMode] = useState(false);

  useEffect(() => {
    api.get(`/api/items/${id}`)
      .then(r => setItem(r.data))
      .catch(() => toast.error('Item not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/api/items/${id}`);
      toast.success('Item deleted');
      navigate('/items');
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80, color: '#a0a0c0' }}>
      Loading...
    </div>
  );
  if (!item) return (
    <div style={{ textAlign: 'center', padding: 80 }}>Item not found.</div>
  );

  const isOwner = user && item.postedBy._id === user.id;
  const canClaim = user && !isOwner && item.type === 'found' && item.status === 'active';

  // Use questions from DB (generated from finder's input)
  // Fall back only if none stored
  const questions = (item.verificationQuestions && item.verificationQuestions.length > 0)
    ? item.verificationQuestions
    : fallbackQuestions(item);

  if (claimMode) return (
    <ClaimWizard
      item={item}
      questions={questions}
      onCancel={() => setClaimMode(false)}
    />
  );

  return (
    <div className="page fade-in" style={{ maxWidth: 780 }}>
      <button
        onClick={() => window.history.back()}
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 20 }}
      >← Back</button>

      <div className="card">

        {item.image && (
          <img
            src={`http://localhost:5000${item.image}`}
            alt={item.name}
            style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 12, marginBottom: 22 }}
          />
        )}

        {/* Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <span className={`badge badge-${item.type}`}>
                {item.type === 'lost' ? '⚠ Lost' : '✓ Found'}
              </span>
              <span className="badge" style={{ background: '#1e1e2a', color: '#a0a0c0' }}>
                {item.category}
              </span>
              {item.status === 'claimed' && <span className="badge badge-claimed">Claimed</span>}
            </div>
            <h1 style={{ fontSize: '1.7rem' }}>{item.name}</h1>
          </div>
          {isOwner && (
            <button onClick={handleDelete} className="btn btn-danger btn-sm">🗑 Delete</button>
          )}
        </div>

        {/* Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 11, color: '#606080', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Description</div>
            <p style={{ color: '#a0a0c0', lineHeight: 1.7 }}>{item.description}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              ['Location', `📍 ${item.location}`],
              ['Date', `📅 ${new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`],
              ['Posted by', `👤 ${item.postedBy.name}${item.postedBy.department ? ' · ' + item.postedBy.department : ''}`],
              item.postedBy.phone ? ['Contact', `📞 ${item.postedBy.phone}`] : null
            ].filter(Boolean).map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: '#606080', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>{label}</div>
                <div style={{ color: '#f0f0f8' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Finder sees this ── */}
        {item.type === 'found' && isOwner && (
          <div style={{ background: 'rgba(67,232,176,0.06)', border: '1px solid rgba(67,232,176,0.2)', borderRadius: 12, padding: 18, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, background: '#43e8b0', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>✅</div>
              <div>
                <div style={{ fontWeight: 700, color: '#43e8b0' }}>You posted this found item</div>
                <div style={{ fontSize: 13, color: '#a0a0c0' }}>
                  {questions.length} unique verification questions have been prepared for the owner
                </div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: '#a0a0c0', lineHeight: 1.7 }}>
              These questions were generated from your description. When the true owner finds this listing,
              they must answer them to prove ownership.
              <strong style={{ color: '#f0f0f8' }}> You do not need to answer anything.</strong>
            </p>
            {/* Show finder what questions were generated */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: '#606080', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Questions the owner will be asked:
              </div>
              {questions.map((q, i) => (
                <div key={i} style={{ background: '#1e1e2a', borderRadius: 8, padding: '8px 14px', marginBottom: 6, fontSize: 13, color: '#a0a0c0' }}>
                  <span style={{ color: '#43e8b0', fontWeight: 700, marginRight: 8 }}>Q{i + 1}.</span>{q}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Claimer (lost user) sees this ── */}
        {canClaim && (
          <div>
            <div style={{ background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 12, padding: 18, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, background: '#6c63ff', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>🧠</div>
                <div>
                  <div style={{ fontWeight: 700 }}>Think this is yours?</div>
                  <div style={{ fontSize: 13, color: '#a0a0c0' }}>
                    Answer {questions.length} questions based on what the finder described
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: '#a0a0c0', lineHeight: 1.7 }}>
                The verification questions are generated from the finder's own description of this{' '}
                <strong>{item.category}</strong>. Only the true owner would know the answers.
                Be as specific as possible — your score decides the outcome.
              </p>
            </div>
            <button
              onClick={() => setClaimMode(true)}
              className="btn btn-primary"
              style={{ width: '100%', padding: 15, fontSize: 15 }}
            >
              🙋 This is Mine — Start Verification
            </button>
          </div>
        )}

        {/* Lost item — encourage finder to post */}
        {item.type === 'lost' && !isOwner && user && (
          <div style={{ background: 'rgba(255,77,109,0.06)', border: '1px solid rgba(255,77,109,0.2)', borderRadius: 12, padding: 18 }}>
            <p style={{ fontSize: 14, color: '#a0a0c0', lineHeight: 1.7 }}>
              📢 Someone is looking for this item. If you found it,
              <strong style={{ color: '#f0f0f8' }}> post it as a Found Item</strong> so the owner can claim it.
            </p>
            <Link to="/post" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', marginTop: 12 }}>
              ✅ I Found This Item
            </Link>
          </div>
        )}

        {/* Not logged in */}
        {!user && item.type === 'found' && item.status === 'active' && (
          <div style={{ textAlign: 'center', padding: 20, background: '#1e1e2a', borderRadius: 12 }}>
            <p style={{ color: '#a0a0c0', marginBottom: 14 }}>Log in to claim this item</p>
            <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex' }}>Log In to Claim</Link>
          </div>
        )}

        {/* Already claimed */}
        {item.status === 'claimed' && (
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(255,214,10,0.08)', border: '1px solid rgba(255,214,10,0.2)', borderRadius: 12, color: '#ffd60a' }}>
            ✓ This item has been claimed and returned to its owner
          </div>
        )}

      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// CLAIM WIZARD — only shown to lost user
// ─────────────────────────────────────────
function ClaimWizard({ item, questions, onCancel }) {
  const [step, setStep] = useState('intro');
  const [answers, setAnswers] = useState(
    questions.map(q => ({ question: q, answer: '' }))
  );
  const [current, setCurrent] = useState(0);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const total = answers.length;

  const updateAnswer = val =>
    setAnswers(prev => prev.map((a, i) => i === current ? { ...a, answer: val } : a));

  const next = () => {
    if (!answers[current].answer.trim()) {
      toast.warning('Please answer before continuing.');
      return;
    }
    if (current < total - 1) setCurrent(c => c + 1);
    else setStep('review');
  };

  const submit = async () => {
    setSubmitting(true);
    setStep('result');
    try {
      const res = await api.post('/api/claims', {
        itemId: item._id,
        verificationAnswers: answers,
        additionalNote: note
      });
      setResult(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
      setStep('review');
    } finally {
      setSubmitting(false);
    }
  };

  // INTRO
  if (step === 'intro') return (
    <div className="page" style={{ maxWidth: 560 }}>
      <div className="card fade-in" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🙋</div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 10 }}>Prove It's Yours</h2>
        <p style={{ color: '#a0a0c0', lineHeight: 1.7, marginBottom: 8 }}>
          Someone found a <strong style={{ color: '#f0f0f8' }}>{item.category}</strong> called{' '}
          <strong style={{ color: '#f0f0f8' }}>"{item.name}"</strong> at{' '}
          <strong style={{ color: '#f0f0f8' }}>{item.location}</strong>.
        </p>
        <p style={{ color: '#a0a0c0', lineHeight: 1.7, marginBottom: 22 }}>
          You'll answer <strong style={{ color: '#f0f0f8' }}>{total} questions</strong> generated
          from the finder's description. Only the true owner would know these answers.
        </p>
        <div style={{ background: '#1e1e2a', borderRadius: 10, padding: 16, marginBottom: 22, textAlign: 'left' }}>
          <p style={{ fontSize: 13, color: '#43e8b0', fontWeight: 600, marginBottom: 10 }}>
            How to get a high score:
          </p>
          {[
            '✅ Answer based on your actual memory of the item',
            '✅ Be specific — exact colours, numbers, brands, locations',
            '✅ Mention details the finder would have noticed',
            '⚠️ Vague answers like "I think" or "maybe" reduce your score',
            '⚠️ Short one-word answers will be penalised',
          ].map((t, i) => (
            <p key={i} style={{ fontSize: 13, color: '#a0a0c0', marginBottom: 5 }}>{t}</p>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button onClick={() => setStep('questions')} className="btn btn-primary" style={{ flex: 2, padding: 13 }}>
            I'm Ready — Start →
          </button>
        </div>
      </div>
    </div>
  );

  // QUESTIONS
  if (step === 'questions') return (
    <div className="page" style={{ maxWidth: 560 }}>
      <div className="card fade-in">

        {/* Progress */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#a0a0c0', marginBottom: 8 }}>
            <span>Question {current + 1} of {total}</span>
            <span>{Math.round(((current + 1) / total) * 100)}%</span>
          </div>
          <div className="score-track">
            <div className="score-fill" style={{ width: `${((current + 1) / total) * 100}%`, background: '#6c63ff' }} />
          </div>
          <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
            {answers.map((a, i) => (
              <div key={i} style={{
                flex: 1, height: 4, borderRadius: 2,
                background: i === current ? '#6c63ff' : a.answer ? '#43e8b0' : '#2a2a3a',
                transition: 'background 0.3s'
              }} />
            ))}
          </div>
        </div>

        {/* Item reminder */}
        <div style={{ background: '#1e1e2a', borderRadius: 8, padding: '8px 14px', marginBottom: 18, fontSize: 13, color: '#a0a0c0' }}>
          🔍 Claiming: <strong style={{ color: '#f0f0f8' }}>{item.name}</strong> · {item.category} · Found at {item.location}
        </div>

        {/* Question */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 18 }}>
          <div style={{
            minWidth: 36, height: 36, borderRadius: '50%', background: '#6c63ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 15, flexShrink: 0
          }}>
            {current + 1}
          </div>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.65, paddingTop: 4, color: '#f0f0f8' }}>
            {answers[current].question}
          </p>
        </div>

        <textarea
          key={current}
          value={answers[current].answer}
          onChange={e => updateAnswer(e.target.value)}
          placeholder="Type your answer here. Be specific — mention exact details you remember about this item..."
          rows={4}
          style={{ resize: 'vertical', marginBottom: 8 }}
          autoFocus
        />
        <p style={{ fontSize: 12, color: '#606080', marginBottom: 20 }}>
          💡 More detail = higher score. The questions are based on what the finder observed.
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          {current > 0 && (
            <button onClick={() => setCurrent(c => c - 1)} className="btn btn-ghost" style={{ flex: 1 }}>← Back</button>
          )}
          <button onClick={next} className="btn btn-primary" style={{ flex: 2, padding: 13 }}>
            {current < total - 1 ? 'Next Question →' : 'Review Answers →'}
          </button>
        </div>
      </div>
    </div>
  );

  // REVIEW
  if (step === 'review') return (
    <div className="page" style={{ maxWidth: 560 }}>
      <div className="card fade-in">
        <h2 style={{ fontSize: '1.4rem', marginBottom: 6 }}>Review Your Answers</h2>
        <p style={{ color: '#a0a0c0', fontSize: 14, marginBottom: 20 }}>
          All answers will be scored together. Make sure each one is as detailed as possible.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {answers.map((a, i) => (
            <div key={i} style={{ background: '#1e1e2a', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 12, color: '#6c63ff', fontWeight: 600, marginBottom: 6 }}>
                Q{i + 1}: {a.question}
              </div>
              <p style={{
                fontSize: 14, lineHeight: 1.6, fontStyle: 'italic',
                color: a.answer ? '#f0f0f8' : '#ff4d6d'
              }}>
                {a.answer ? `"${a.answer}"` : '⚠️ No answer — please edit'}
              </p>
              <button
                onClick={() => { setCurrent(i); setStep('questions'); }}
                style={{ background: 'none', border: 'none', color: '#6c63ff', fontSize: 12, cursor: 'pointer', padding: 0, marginTop: 6 }}
              >
                Edit ✏
              </button>
            </div>
          ))}
        </div>
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label>Additional Proof (optional)</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Receipt, purchase date, serial number, who bought it, any other proof..."
            rows={2}
          />
        </div>
        <button onClick={submit} className="btn btn-primary" style={{ width: '100%', padding: 14, fontSize: 15 }}>
          Submit for Verification →
        </button>
      </div>
    </div>
  );

  // RESULT
  if (step === 'result') return (
    <div className="page" style={{ maxWidth: 520 }}>
      {submitting ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 52, marginBottom: 18, animation: 'pulse 1.5s infinite' }}>🧠</div>
          <h2 style={{ marginBottom: 10 }}>Scoring your answers...</h2>
          <p style={{ color: '#a0a0c0' }}>Matching your responses against the finder's description.</p>
          <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Checking answer specificity...', 'Comparing with item description...', 'Calculating final score...'].map((msg, i) => (
              <div key={i} style={{ fontSize: 13, color: '#606080', animation: `pulse ${1.2 + i * 0.4}s infinite` }}>
                ⏳ {msg}
              </div>
            ))}
          </div>
        </div>
      ) : result ? (
        <VerificationResult result={result} item={item} onBack={onCancel} />
      ) : null}
    </div>
  );

  return null;
}

// ─────────────────────────────────────────
// RESULT
// ─────────────────────────────────────────
function VerificationResult({ result, item, onBack }) {
  const verdict = result.claim.aiVerdict;
  const score = verdict.score;
  const passed = verdict.passed;
  const color = score >= 80 ? '#43e8b0' : score >= 60 ? '#ffd60a' : '#ff4d6d';

  return (
    <div className="card fade-in" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 52, marginBottom: 14 }}>
        {score >= 80 ? '🎉' : score >= 60 ? '⚠️' : '❌'}
      </div>
      <h2 style={{ fontSize: '1.7rem', marginBottom: 6 }}>
        {score >= 80 ? 'Strong Match!' : score >= 60 ? 'Partial Match' : 'Low Confidence'}
      </h2>
      <p style={{ color: '#a0a0c0', marginBottom: 22, fontSize: 14 }}>
        Verification complete for <strong style={{ color: '#f0f0f8' }}>{item.name}</strong>
      </p>

      {/* Score ring */}
      <div style={{
        margin: '0 auto 22px', width: 120, height: 120, borderRadius: '50%',
        background: `conic-gradient(${color} ${score * 3.6}deg, #1e1e2a 0)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          width: 88, height: 88, borderRadius: '50%', background: '#16161f',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, color }}>{score}</div>
          <div style={{ fontSize: 10, color: '#606080', textTransform: 'uppercase' }}>/ 100</div>
        </div>
      </div>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '9px 20px', borderRadius: 999, marginBottom: 20,
        background: passed ? 'rgba(67,232,176,0.1)' : 'rgba(255,77,109,0.1)',
        border: `1px solid ${passed ? 'rgba(67,232,176,0.3)' : 'rgba(255,77,109,0.3)'}`,
        color: passed ? '#43e8b0' : '#ff4d6d', fontWeight: 700
      }}>
        {passed ? '✓ Verification Passed' : '✗ Verification Failed'}
      </div>

      {verdict.flagged && (
        <div style={{ background: 'rgba(255,214,10,0.1)', border: '1px solid rgba(255,214,10,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 14, color: '#ffd60a' }}>
          ⚠️ Some answers were flagged. Admin will review before approving.
        </div>
      )}

      <div style={{ background: '#1e1e2a', borderRadius: 12, padding: 18, marginBottom: 16, textAlign: 'left' }}>
        <div style={{ fontSize: 11, color: '#606080', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>Verdict</div>
        <p style={{ color: '#a0a0c0', lineHeight: 1.7, fontSize: 14 }}>{verdict.reasoning}</p>
      </div>

      <div style={{ background: '#1e1e2a', borderRadius: 12, padding: 18, marginBottom: 22, textAlign: 'left' }}>
        <div style={{ fontSize: 11, color: '#606080', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>What happens next</div>
        <p style={{ fontSize: 14, color: '#a0a0c0', lineHeight: 1.7 }}>
          {score >= 80
            ? '✅ Auto-approved! Go to My Claims to see the finder\'s contact details and arrange collection.'
            : passed
            ? '✅ Passed. Admin will do a quick final review and notify you shortly.'
            : '❌ Score too low for auto-approval. Admin will review. If you truly own it, provide additional proof in the note.'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onBack} className="btn btn-ghost" style={{ flex: 1 }}>← Back to Item</button>
        <Link to="/my-claims" className="btn btn-primary" style={{ flex: 1, display: 'inline-flex', justifyContent: 'center' }}>
          View My Claims
        </Link>
      </div>
    </div>
  );
}