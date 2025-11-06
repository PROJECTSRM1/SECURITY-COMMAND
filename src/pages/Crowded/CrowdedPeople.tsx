
// import React from "react";
import { useNavigate } from "react-router-dom";
import "./CrowdedPeople.css";
// import type Title from "antd/es/skeleton/Title";

const feeds = [
  { id: 1, src: "https://media.istockphoto.com/id/474291174/photo/varanasi-crowd.jpg?b=1&s=612x612&w=0&k=20&c=N5RfZ5wQ_71oDpKYed7zqVt7X_AbXhzw6BEoj_fntRA=", label: "Camera 1", camlink: "https://www.youtube.com/embed/VnvAffnMd2k?autoplay=1&mute=1&controls=1&loop=1&playlist=VnvAffnMd2k&start=4" },
  { id: 2, src: "https://media.istockphoto.com/id/1457546193/photo/sea-of-crowd.jpg?b=1&s=612x612&w=0&k=20&c=bmafQhL_Eyg4u4noo3SRvN7tJ4C3j0uF-So72QRVSjU=", label: "Camera 2", camlink: "https://www.youtube.com/embed/VnvAffnMd2k?autoplay=1&mute=1&controls=1&loop=1&playlist=VnvAffnMd2k&start=4", },
  { id: 3, src: "https://media.istockphoto.com/id/527617369/photo/crowded-istiklal-street-in-istanbul.jpg?b=1&s=612x612&w=0&k=20&c=gbMg3alFQurbmNkk5waIzAyQoHkXmxAmHM6qGWD-R_w=", label: "Camera 3", camlink: "https://www.youtube.com/embed/VnvAffnMd2k?autoplay=1&mute=1&controls=1&loop=1&playlist=VnvAffnMd2k&start=4", },
  { id: 4, src: "https://media.istockphoto.com/id/2222928140/photo/busy-traffic-scene-in-old-delhi-during-rush-hour.jpg?b=1&s=612x612&w=0&k=20&c=ln8ilWhnI1lsyMhEENSQGTD1h2a9ZTexrukzbcw3gqI=", label: "Camera 4", camlink: "https://www.youtube.com/embed/VnvAffnMd2k?autoplay=1&mute=1&controls=1&loop=1&playlist=VnvAffnMd2k&start=4", },
];

const CrowdedPeople = () => {
  const navigate = useNavigate();
  return (
    <div className="crowd-grid-container">
      {feeds.map((feed) => (
        <div
          key={feed.id}
          className="crowd-feed-card"
          onClick={() => navigate("/app/cctv-ai-feeds", {
            state: {
              Title: feed.label,
              camlink: feed.camlink,
              showPeople: true

            }
          })
          }
        >
          <img
            src={feed.src}
            alt={feed.label}
            className="crowd-image"
            loading="lazy"
          />
          <div className="crowd-feed-label">{feed.label}</div>
        </div>
      ))}
    </div>
  );
};

export default CrowdedPeople;
