module.exports = {
    adminAuth : 4,
    writerAuth : 1,
    adminNav : [
        {nav : "앱 사용자 편집", navLink : "/admin/editUser"},
        {nav : "기관원 목록 편집", navLink : "/admin/editClassMember"},
        {nav : "서기 데이터 보기", navLink : "/board/view"},
        {nav : "기관 출석 체크", navLink : "/board"},
        {nav : "연간 행사 편집", navLink : "/planner"},
        {nav : "로그아웃", navLink : "/auth/signout"},
    ],
    userNav : [
        {nav : "서기 데이터 보기", navLink : "/board/view"},
        {nav : "기관 출석 체크", navLink : "/board"},
        {nav : "로그아웃", navLink : "/auth/signout"},
    ],
}