
import React, { useState } from "react";
import { Drawer } from "antd";
// import "./CrowdedPeople.css";
import CctvAiFeeds from "../anpr/CctvAiFeeds"; // adjust path if needed

const feeds = [
  { id: 1, src: "https://media.istockphoto.com/id/474291174/photo/varanasi-crowd.jpg?b=1&s=612x612&w=0&k=20&c=N5RfZ5wQ_71oDpKYed7zqVt7X_AbXhzw6BEoj_fntRA=", label: "Camera 1", camlink: "https://www.youtube.com/embed/VnvAffnMd2k?autoplay=1&mute=1&controls=1&loop=1&playlist=VnvAffnMd2k&start=4" },
  { id: 2, src: "https://media.istockphoto.com/id/1457546193/photo/sea-of-crowd.jpg?b=1&s=612x612&w=0&k=20&c=bmafQhL_Eyg4u4noo3SRvN7tJ4C3j0uF-So72QRVSjU=", label: "Camera 2", camlink: "https://www.youtube.com/embed/VnvAffnMd2k?autoplay=1&mute=1&controls=1&loop=1&playlist=VnvAffnMd2k&start=4" },
  { id: 3, src: "https://media.istockphoto.com/id/527617369/photo/crowded-istiklal-street-in-istanbul.jpg?b=1&s=612x612&w=0&k=20&c=gbMg3alFQurbmNkk5waIzAyQoHkXmxAmHM6qGWD-R_w=", label: "Camera 3", camlink: "https://www.youtube.com/embed/VnvAffnMd2k?autoplay=1&mute=1&controls=1&loop=1&playlist=VnvAffnMd2k&start=4" },
  { id: 4, src: "https://media.istockphoto.com/id/2222928140/photo/busy-traffic-scene-in-old-delhi-during-rush-hour.jpg?b=1&s=612x612&w=0&k=20&c=ln8ilWhnI1lsyMhEENSQGTD1h2a9ZTexrukzbcw3gqI=", label: "Camera 4", camlink: "https://www.youtube.com/embed/VnvAffnMd2k?autoplay=1&mute=1&controls=1&loop=1&playlist=VnvAffnMd2k&start=4" },
];

const CrowdedPeople: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<typeof feeds[0] | null>(null);

  const openFeed = (feed: typeof feeds[0]) => {
    setSelectedFeed(feed);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    // clear after close to free memory
    setTimeout(() => setSelectedFeed(null), 300);
  };

  return (
    <div className="rjb-crowd-page">
      <div className="rjb-crowd-grid-container">
        {feeds.map((feed) => (
          <div
            key={feed.id}
            className="rjb-crowd-feed-card"
            onClick={() => openFeed(feed)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openFeed(feed); }}
          >
            <img src={feed.src} alt={feed.label} className="rjb-crowd-image" loading="lazy" />
            <div className="rjb-crowd-feed-label">{feed.label}</div>
          </div>
        ))}
      </div>

      <Drawer
        className="rjb-drawer-wrap"
        title={selectedFeed?.label ?? "Camera Feed"}
        placement="right"
        width={800}            /* default desktop width - CSS overrides it responsively */
        onClose={closeDrawer}
        open={drawerOpen}
        destroyOnClose={true}
      >
        {/* drawer body must use a CSS class that provides full-height layout */}
        {selectedFeed ? (
          <div className="rjb-drawer-inner">
            {/* CctvAiFeeds should itself be height-aware and stretch to fill parent */}
            <CctvAiFeeds camlink={selectedFeed.camlink} title={selectedFeed.label} showPeople={true} />
          </div>
        ) : null}
      </Drawer>
    </div>
  );
};

export default CrowdedPeople;
