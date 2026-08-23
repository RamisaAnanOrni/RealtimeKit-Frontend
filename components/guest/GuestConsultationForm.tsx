'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GuestConsultationForm() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [problem, setProblem] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!phone.trim() || !problem.trim()) {
      setError('Add your phone number and a short summary so a veterinarian can reach you.');
      return;
    }

    setIsSubmitting(true);
    console.log({ phone,description });
    await new Promise((resolve) => setTimeout(resolve, 650));
    router.push(`/guest_mode/status?problem=${encodeURIComponent(problem)}&phone=${encodeURIComponent(phone)}`);
  };

  return (
    <div className="guest-layout">
      <section className="guest-hero" aria-labelledby="guest-hero-title">
        <div className="guest-hero-copy">
          <div className="secure-badge"><span className="material-symbols-outlined" aria-hidden="true">lock</span> Secure telehealth</div>
          <p className="guest-eyebrow">Care that meets you where you are</p>
          <h1 id="guest-hero-title">Expert care for every animal in your care.</h1>
          <p className="guest-hero-description">Connect with a qualified veterinarian quickly, wherever your farm takes you. No account or long forms required.</p>
          <div className="guest-stats">
            <div><strong>120+</strong><span>certified vets</span></div>
            <div><strong>&lt; 10 min</strong><span>emergency response</span></div>
          </div>
        </div>
        <div className="livestock-illustration" aria-label="Illustration of a cared-for cow and veterinarian" role="img">
          <div className="sun-disc" />
          <div className="field-line" />
          <div className="vet-figure"><span className="vet-head" /><span className="vet-body" /><span className="vet-arm" /></div>
          <div className="cow-figure"><span className="cow-head" /><span className="cow-body" /><span className="cow-leg cow-leg-one" /><span className="cow-leg cow-leg-two" /><span className="cow-tail" /></div>
          <span className="leaf leaf-one">✦</span><span className="leaf leaf-two">✦</span>
        </div>
      </section>

      <section className="guest-form-panel" aria-labelledby="guest-form-title">
        <div className="form-intro">
          <div className="form-icon"><span className="material-symbols-outlined" aria-hidden="true">medical_services</span></div>
          <p className="guest-eyebrow">Quick consultation</p>
          <h2 id="guest-form-title">Guest Mode</h2>
          <p>Request help without creating an account. A veterinarian will call you back on the number you provide.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="phone">Phone number <span>Required</span></label>
            <div className="input-wrap">
              <span className="material-symbols-outlined" aria-hidden="true">call</span>
            <input
              id="phone"
              type="tel"
              placeholder="e.g. 07700 900123"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="problem">What is happening? <span>Required</span></label>
            <div className="input-wrap">
              <span className="material-symbols-outlined" aria-hidden="true">medical_services</span>
              <input id="problem" type="text" placeholder="e.g. Cow is not eating" value={problem} onChange={(e) => setProblem(e.target.value)} />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="description">Add more detail <small>Optional</small></label>
            <textarea
              id="description"
              rows={3}
              placeholder="Tell us when it started, symptoms you have noticed, or anything else that may help."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            <span>{isSubmitting ? 'Sending request...' : 'Submit Request'}</span>
            {isSubmitting ? <span className="button-spinner" aria-hidden="true" /> : <span className="material-symbols-outlined" aria-hidden="true">north_east</span>}
          </button>
          <p className="form-footnote"><span className="material-symbols-outlined" aria-hidden="true">lock</span> Your details are only shared with the assigned veterinarian.</p>
        </form>
      </section>
    </div>
  );
}