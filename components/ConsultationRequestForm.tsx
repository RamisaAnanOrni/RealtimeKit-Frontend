"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createConsultationRequest } from "@/lib/farmer-api";
import { getErrorMessage } from "@/lib/api";
import { AlertCircle, Loader2 } from "lucide-react";

interface ConsultationFormProps {
  onSuccess?: (consultationId: number) => void;
}

export default function ConsultationRequestForm({
  onSuccess,
}: ConsultationFormProps) {
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    animal_type: "",
    breed: "",
    gender: "",
    age: "",
    health_problem: "",
  });

  const [animalImage, setAnimalImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Handle text input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAnimalImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate required fields
    if (!formData.animal_type) {
      setError("Please select an animal type.");
      setLoading(false);
      return;
    }

    if (!formData.health_problem.trim()) {
      setError("Please describe the health problem.");
      setLoading(false);
      return;
    }

    try {
      const response = await createConsultationRequest({
        ...formData,
        health_problem: formData.health_problem.trim(),
        cow_image: animalImage || undefined,
      });

      // Success! Redirect to consultation status page
      if (onSuccess) {
        onSuccess(response.id);
      } else {
        // Default redirect
        router.push(`/farmer/consultation/${response.id}/status`);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Tele-Health Consultation Request
        </h1>
        <p className="text-text-muted">
          Please provide details about your animal and the health concern.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-900 dark:text-red-200 flex gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Animal Type */}
        <div className="space-y-2">
          <label htmlFor="animal_type" className="block font-medium text-foreground">
            Animal Type <span className="text-red-500">*</span>
          </label>
          <select
            id="animal_type"
            name="animal_type"
            value={formData.animal_type}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select an animal type...</option>
            <option value="DOG">Dog</option>
            <option value="CAT">Cat</option>
            <option value="COW">Cow</option>
            <option value="GOAT">Goat</option>
            <option value="BUFFALO">Buffalo</option>
            <option value="SHEEP">Sheep</option>
            <option value="POULTRY">Poultry</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Breed */}
        <div className="space-y-2">
          <label htmlFor="breed" className="block font-medium text-foreground">
            Breed
          </label>
          <input
            id="breed"
            type="text"
            name="breed"
            value={formData.breed}
            onChange={handleInputChange}
            placeholder="e.g., German Shepherd, Deshi, Holstein"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label htmlFor="gender" className="block font-medium text-foreground">
            Gender
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="MALE"
                checked={formData.gender === "MALE"}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              <span className="text-foreground">Male</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="FEMALE"
                checked={formData.gender === "FEMALE"}
                onChange={handleInputChange}
                className="w-4 h-4"
              />
              <span className="text-foreground">Female</span>
            </label>
          </div>
        </div>

        {/* Age */}
        <div className="space-y-2">
          <label htmlFor="age" className="block font-medium text-foreground">
            Age
          </label>
          <input
            id="age"
            type="text"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="e.g., 2 Years, 6 Months"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Health Problem */}
        <div className="space-y-2">
          <label htmlFor="health_problem" className="block font-medium text-foreground">
            Health Problem <span className="text-red-500">*</span>
          </label>
          <textarea
            id="health_problem"
            name="health_problem"
            value={formData.health_problem}
            onChange={handleInputChange}
            placeholder="Describe the health issue in detail..."
            rows={5}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            required
          />
        </div>

        {/* Animal Image Upload */}
        <div className="space-y-2">
          <label htmlFor="cow_image" className="block font-medium text-foreground">
            Animal Photo (Optional)
          </label>
          <input
            id="cow_image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-light cursor-pointer"
          />
          {imagePreview && (
            <div className="mt-3 rounded-lg border border-border overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-auto max-h-64 object-cover"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary py-3 px-4 font-semibold text-white shadow-md transition hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Submitting..." : "Request Vet"}
        </button>
      </form>
    </div>
  );
}
