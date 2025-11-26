import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "../pages/HomePage";

function ScrollToTop() {
	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [pathname]);
	return null;
}

export function MainRouter() {
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<HomePage />} />
		</Routes>
		<ScrollToTop />
	</BrowserRouter>;
}
