import { useEffect, useState } from "react";
import { getActiveAnnouncements } from "../../services/storage";
import styles from "./AnnouncementBar.module.css";

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const data = await getActiveAnnouncements();

        setAnnouncements(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Failed to load announcements:",
          error
        );

        setAnnouncements([]);
      }
    }

    loadAnnouncements();
  }, []);

  if (announcements.length === 0) {
    return null;
  }

  const repeatedAnnouncements = [
    ...announcements,
    ...announcements,
  ];

  return (
    <section
      className={styles.bar}
      aria-label="Store announcements"
    >
      <div className={styles.track}>
        {repeatedAnnouncements.map(
          (announcement, index) => (
            <div
              className={styles.item}
              key={`${announcement.id}-${index}`}
              dir="auto"
            >
              <span className={styles.icon}>✦</span>

              <span>{announcement.content}</span>

              <span className={styles.separator}>•</span>
            </div>
          )
        )}
      </div>
    </section>
  );
}