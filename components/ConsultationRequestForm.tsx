"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createConsultationRequest } from "@/lib/farmer-api";
import { getErrorMessage, getStoredAuth, normalizeRole } from "@/lib/api";
import {
  Check,
  ChevronDown,
  ImagePlus,
  Loader2,
  Mars,
  Send,
  Venus,
  X,
} from "lucide-react";

interface ConsultationFormProps {
  onSuccess?: (consultationId: number) => void;
}

// Exact AuthPanel input styling: soft tinted border, tall hit area, emerald
// focus ring on a focusable emerald border.
const inputClass =
  "h-11 w-full rounded-lg border border-[#d7e3df] bg-white px-3 text-sm text-[#17352d] outline-none transition placeholder:text-[#8aa099] focus:border-[#07533f] focus:ring-2 focus:ring-[#07533f]/10";

const textareaClass =
  "w-full min-h-[50px] max-h-[160px] resize-none overflow-y-auto rounded-lg border border-[#d7e3df] bg-white px-3 py-3 text-sm text-[#17352d] outline-none transition placeholder:text-[#8aa099] focus:border-[#07533f] focus:ring-2 focus:ring-[#07533f]/10";

// Exact AuthPanel label style.
const labelClass = "mb-1 block text-xs font-semibold text-[#45635a]";

const sectionHeading = "text-[11px] font-bold uppercase tracking-wider text-[#45635a]";

// Breed options keyed by Animal Type so the Breed control adapts to the
// animal the farmer actually owns (shared/list varies per species).
const BREED_OPTIONS: Record<string, string[]> = {
  DOG: ["German Shepherd", "Golden Retriever", "Local Deshi", "Pug", "Street Dog"],
  CAT: ["Persian", "Local Deshi", "Mixed Breed"],
  COW: [
    "Holstein Friesian",
    "Sahiwal",
    "Red Chittagong",
    "Friesian Cross",
    "Deshi",
  ],
  GOAT: ["Black Bengal", "Jamunapari", "Garole", "Barbari", "Deshi"],
  BUFFALO: ["Murrah", "Nili-Ravi", "Local"],
  SHEEP: ["Garole", "Dumba", "Local"],
  POULTRY: ["Sonali", "Broiler", "Layer", "Deshi"],
  OTHER: ["Local / Mixed", "Other"],
};

const DEFAULT_BREEDS = ["Local / Mixed", "Other"];

export default function ConsultationRequestForm({
  onSuccess,
}: ConsultationFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const healthProblemRef = useRef<HTMLTextAreaElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    gender: "",
    age: "",
    health_problem: "",
  });

  // Breed-dependent state: choosing a new Animal Type always resets Breed.
  const [animalType, setAnimalType] = useState("");
  const [breed, setBreed] = useState("");

  const [animalImage, setAnimalImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const breedOptions = animalType
    ? (BREED_OPTIONS[animalType] ?? DEFAULT_BREEDS)
    : DEFAULT_BREEDS;

  // Animal Type <select>: updates animalType and invalidates any chosen breed.
  const handleAnimalTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setAnimalType(value);
    setBreed("");
    setError(null);
  };

  // Breed <select>: updates breed once an animal type is available.
  const handleBreedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setBreed(value);
    setError(null);
  };

// Handle text input changes (age, health_problem)
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  // Auto-grow the Health Problem textarea as lines are added, capped at 160px.
  const autoGrow = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  // Gender toggle (button-style pills)
  const handleGenderSelect = (value: string) => {
    setFormData((prev) => ({ ...prev, gender: value }));
    setError(null);
  };

  // Shared file-setter used by the picker and drag & drop.
  const setFileData = (file: File | undefined | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    setAnimalImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  // Handle image upload via the file picker
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileData(e.target.files?.[0]);
  };

  const clearImage = () => {
    setAnimalImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Auth / role guard: only a logged-in FARMER may submit. Prevents a VET
    // (or leftover) token from being replayed against the farmer endpoint.
    const auth = getStoredAuth();
    if (!auth?.access) {
      setError("Authentication required. Redirecting to sign in...");
      setLoading(false);
      router.push("/auth");
      return;
    }
    if (normalizeRole(auth.role) !== "farmer") {
      setError(
        "Only farmer accounts can submit consultation requests. Redirecting to sign in...",
      );
      setLoading(false);
      router.push("/auth");
      return;
    }

    // Validate required fields
    if (!animalType) {
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
        animal_type: animalType,
        breed,
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
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      {/* Error Alert (AuthPanel style) */}
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      {/* About the Animal */}
      <p className={sectionHeading}>About the Animal</p>

      {/* Animal Type */}
      <label htmlFor="animal_type" className="block">
        <span className={labelClass}>
          Animal Type <span className="text-red-500">*</span>
        </span>
        <span className="relative block">
          <select
            id="animal_type"
            name="animal_type"
            value={animalType}
            onChange={handleAnimalTypeChange}
            className={`${inputClass} appearance-none pr-8 ${
              animalType ? "" : "text-[#8aa099]"
            }`}
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
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8aa099]" />
        </span>
      </label>

      {/* Breed (dynamic dropdown fed by the selected Animal Type) */}
      <label htmlFor="breed" className="block">
        <span className={labelClass}>Breed</span>
        <span className="relative block">
          <select
            id="breed"
            name="breed"
            value={breed}
            onChange={handleBreedChange}
            disabled={!animalType}
            className={`${inputClass} appearance-none pr-8 disabled:cursor-not-allowed disabled:bg-[#fbfcfa] ${
              breed ? "" : "text-[#8aa099]"
            }`}
          >
            <option value="">
              {animalType ? "Select breed..." : "Select an animal type first"}
            </option>
            {breedOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8aa099]" />
        </span>
      </label>

      {/* Gender toggle buttons */}
      <div>
        <span className={labelClass}>Gender</span>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "MALE", label: "Male", Icon: Mars },
            { value: "FEMALE", label: "Female", Icon: Venus },
          ].map(({ value, label, Icon }) => {
            const selected = formData.gender === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleGenderSelect(value)}
                aria-pressed={selected}
                className={`flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition ${
                  selected
                    ? "border-[#063b2b] bg-[#063b2b] text-white shadow"
                    : "border-[#d7e3df] bg-white text-[#567269] hover:border-[#063b2b] hover:text-[#063b2b]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {selected && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Age */}
      <label htmlFor="age" className="block">
        <span className={labelClass}>Age</span>
        <input
          id="age"
          type="text"
          name="age"
          value={formData.age}
          onChange={handleInputChange}
          placeholder="e.g., 2 Years, 6 Months"
          className={inputClass}
        />
      </label>

      {/* Health Details */}
      <p className={`${sectionHeading} border-t border-[#e8f2ef] pt-5`}>Health Details</p>

      {/* Health Problem */}
      <label htmlFor="health_problem" className="block">
        <span className={labelClass}>
          Health Problem <span className="text-red-500">*</span>
        </span>
        <textarea
          id="health_problem"
          ref={healthProblemRef}
          name="health_problem"
          value={formData.health_problem}
          onChange={handleInputChange}
          onInput={(e) => autoGrow(e.currentTarget)}
          placeholder="Describe the health issue in detail..."
          rows={2}
          className={textareaClass}
          required
        />
      </label>

      {/* Animal Photo — compact upload tile */}
      <div>
        <span className={labelClass}>
          Animal Photo <span className="font-normal text-[#8aa099]">(Optional)</span>
        </span>

        {!imagePreview ? (
          <label
            htmlFor="cow_image"
            className="flex h-16 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#c8dcd5] text-[#71877f] transition hover:border-[#063b2b] hover:bg-[#e8f2ef]/50 hover:text-[#063b2b]"
          >
            <span className="mb-1 text-base leading-none">↑</span>
            <span className="text-[10px] font-semibold">Animal Photo</span>
            <input
              id="cow_image"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="sr-only"
            />
          </label>
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[#d7e3df] bg-[#e8f2ef]/40 p-2 pr-3">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={imagePreview}
                alt="Animal photo preview"
                className="h-12 w-12 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-[#45635a]">
                  {animalImage?.name ?? "Photo attached"}
                </p>
                <p className="text-[10px] text-[#8aa099]">Ready to submit</p>
              </div>
              <Check className="h-4 w-4 shrink-0 text-[#0a5240]" />
            </div>
            <button
              type="button"
              onClick={clearImage}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#8aa099] transition hover:bg-red-50 hover:text-red-600"
              title="Remove photo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Submit Button (exact AuthPanel styling) */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#063b2b] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#063b2b]/15 transition hover:bg-[#0a5240] disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {loading ? "Please wait..." : "Request Vet"}
      </button>
      <p className="flex items-start gap-1.5 pt-1 text-[11px] text-[#71877f]">
        <ImagePlus className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        You&apos;ll be connected to a veterinarian shortly after submission.
      </p>
    </form>
  );
}