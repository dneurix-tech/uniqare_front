import { useEffect, useRef, useState } from "react";
import {
  addReview,
  deleteReview,
  getAdminReviews,
  updateReview,
} from "../../services/storage";
import styles from "./ReviewsPage.module.css";

const INITIAL_FORM = {
  customer_name: "",
  description: "",
  rating: 5,
  is_active: true,
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const fileInputRef = useRef(null);

  async function loadReviews() {
    try {
      setLoading(true);
      setMessage("");

      const data = await getAdminReviews();

      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      clearSelectedImage();
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file");
      event.target.value = "";
      return;
    }

    const maxImageSize = 5 * 1024 * 1024;

    if (file.size > maxImageSize) {
      setMessage("Image size must be less than 5 MB");
      event.target.value = "";
      return;
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setMessage("");
  }

  function clearSelectedImage() {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function resetForm() {
    setForm(INITIAL_FORM);
    clearSelectedImage();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanedCustomerName = form.customer_name.trim();
    const cleanedDescription = form.description.trim();

    if (!cleanedDescription && !imageFile) {
      setMessage("Please add a description or select an image");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      await addReview({
        customer_name: cleanedCustomerName,
        description: cleanedDescription,
        rating: Number(form.rating || 5),
        is_active: Boolean(form.is_active),
        image: imageFile,
      });

      resetForm();
      setMessage("Review added successfully");

      await loadReviews();
      setMessage("Review added successfully");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to add review");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(review) {
    try {
      setMessage("");

      await updateReview(review.id, {
        is_active: !review.is_active,
      });

      await loadReviews();
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to update review");
    }
  }

  async function handleDelete(reviewId) {
    const confirmDelete = window.confirm("Delete this review?");

    if (!confirmDelete) {
      return;
    }

    try {
      setMessage("");

      await deleteReview(reviewId);

      setReviews((prev) =>
        prev.filter((review) => review.id !== reviewId)
      );

      setMessage("Review deleted successfully");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to delete review");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Reviews</h1>
        <p>Add brand reviews that will appear to visitors.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          name="customer_name"
          value={form.customer_name}
          onChange={handleChange}
          placeholder="Customer name"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Review description"
          rows="5"
        />

        <div>
          <label htmlFor="review-image">Review Image</label>

          <input
            ref={fileInputRef}
            id="review-image"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleImageChange}
          />

          {imagePreview && (
            <div>
              <img
                src={imagePreview}
                alt="Selected review preview"
                style={{
                  display: "block",
                  width: "160px",
                  height: "160px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  marginTop: "12px",
                }}
              />

              <button
                type="button"
                onClick={clearSelectedImage}
                style={{ marginTop: "8px" }}
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

        <select
          name="rating"
          value={form.rating}
          onChange={handleChange}
        >
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
          />
          Active
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add Review"}
        </button>

        {message && (
          <p className={styles.message}>{message}</p>
        )}
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <div className={styles.list}>
          {reviews.map((review) => (
            <div key={review.id} className={styles.reviewCard}>
              {review.image_url && (
                <img
                  src={review.image_url}
                  alt={review.customer_name || "Customer review"}
                />
              )}

              <div>
                <h3>{review.customer_name || "Customer"}</h3>

                {review.description && (
                  <p>{review.description}</p>
                )}

                <strong>
                  {"★".repeat(Number(review.rating || 5))}
                </strong>

                <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(review)}
                  >
                    {review.is_active ? "Hide" : "Show"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(review.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}