module.exports = {
    adminAuth : 4,
    writerAuth : 1,
    adminNav : [
        {nav : "앱 사용자 편집", navLink : "/admin/editUser"},
        {nav : "기관원 목록 편집", navLink : "/admin/editClassMember"},
        {nav : "데이터 보기", navLink : "/board/view"},
        {nav : "기관 출석 체크", navLink : "/board"},
        {nav : "로그아웃", navLink : "/admin/signout"},
    ],
    userNav : [
        {nav : "데이터 보기", navLink : "/board/view"},
        {nav : "기관 출석 체크", navLink : "/board"},
        {nav : "로그아웃", navLink : "/admin/signout"},
    ],
}