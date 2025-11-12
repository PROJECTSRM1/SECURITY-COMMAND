
import React, { useState } from "react";
import { Drawer } from "antd";
import "./CrowdedPeople.css";
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
    // keep selectedFeed if you need it; we can clear it to free memory
    setTimeout(() => setSelectedFeed(null), 300);
  };

  return (
    <div>
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
        title={selectedFeed?.label ?? "Camera Feed"}
        placement="right"
        width={"70%"}
        onClose={closeDrawer}
        open={drawerOpen}
        bodyStyle={{ padding: 0, height: "100%" }}
        destroyOnClose={true} // unmount to reset timers inside CctvAiFeeds when closed
      >
        {selectedFeed ? (
          // Render CctvAiFeeds in-drawer. showPeople true because this is crowded people page.
          <div style={{ height: "100%", overflow: "hidden" }}>
            <CctvAiFeeds camlink={selectedFeed.camlink} title={selectedFeed.label} showPeople={true} />
          </div>
        ) : null}
      </Drawer>
    </div>
  );
};

export default CrowdedPeople;
