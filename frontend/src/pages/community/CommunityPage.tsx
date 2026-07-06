import { motion } from 'motion/react';
import CommunityForum from '../../domains/forum/posts/ui/CommunityForum';

export default function CommunityPage() {
  return (
    <motion.div
      key="community-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <CommunityForum />
    </motion.div>
  );
}
