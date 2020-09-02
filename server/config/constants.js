module.exports = {
	adminAuth: "admin",
	executivesAuth: "executives",
	writerAuth: "writer",

	nav: {
		//the name of below navigation array must be name at above in "".
		admin: [
			{ nav: "앱 사용자 편집", navLink: "/admin/editUser" },
			{ nav: "기관원 목록 편집", navLink: "/admin/editClassMember" },
			{ nav: "서기 데이터 보기", navLink: "/board/view" },
			{ nav: "기관 출석 체크", navLink: "/board" },
			{ nav: "연간 행사 편집", navLink: "/planner" },
			{ nav: "로그아웃", navLink: "/auth/signout" },
		],
		executives: [
			{ nav: "서기 데이터 보기", navLink: "/board/view" },
			{ nav: "기관 출석 체크", navLink: "/board" },
			{ nav: "연간 행사 편집", navLink: "/planner" },
			{ nav: "로그아웃", navLink: "/auth/signout" },
		],
		writer: [
			{ nav: "서기 데이터 보기", navLink: "/board/view" },
			{ nav: "기관 출석 체크", navLink: "/board" },
			{ nav: "로그아웃", navLink: "/auth/signout" },
		],
	},
};
