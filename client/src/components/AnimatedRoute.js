import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { Route, useLocation } from "react-router-dom";

const AnimatedRoute = ({ path, children }) => {
    const location = useLocation();
    const controls = useAnimation();

    useEffect(() => {
        controls.start({
            y: '0%', // Slide in from the right
            opacity: 1, // Make it visible
            transition: { duration: 0.5 }, // Customize animation duration
        })
    }
        , [path])

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: '100%' }} // Initial position and opacity
                animate={controls}
                key={path}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
};

export default AnimatedRoute;
