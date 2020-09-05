module.exports = {
	adminAuth: "admin",
	executivesAuth: "executives",
	writerAuth: "writer",

	//each name below array must be same name at above string in "".
	authList: ["", "writer", "executives", "executives", "admin"],

	nav: {
		//the name of below navigation array must be name at above in "".
		admin: [
			{ nav: "상태 변경하기", navLink: "/admin/state" },
			{ nav: "기관 출석 체크", navLink: "/class/board" },
			{ nav: "서기 데이터 보기", navLink: "/class/board/view" },
			{ nav: "사용자 편집", navLink: "/admin/editUser" },
			{ nav: "연간 행사 편집", navLink: "/grade/planner" },
			{ nav: "공지사항 편집", navLink: "/grade/notice" },
			{ nav: "로그아웃", navLink: "/auth/signout" },
		],
		executives: [
			{ nav: "기관 출석 체크", navLink: "/class/board" },
			{ nav: "서기 데이터 보기", navLink: "/class/board/view" },
			{ nav: "사용자 편집", navLink: "/grade/editUser" },
			{ nav: "연간 행사 편집", navLink: "/grade/planner" },
			{ nav: "공지사항 편집", navLink: "/grade/notice" },
			{ nav: "로그아웃", navLink: "/auth/signout" },
		],
		writer: [
			{ nav: "기관 출석 체크", navLink: "/class/board" },
			{ nav: "서기 데이터 보기", navLink: "/class/board/view" },
			{ nav: "로그아웃", navLink: "/auth/signout" },
		],
	},
};
