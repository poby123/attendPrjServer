
$('.toggle').click(function(){
  $('.toggleTarget').animate({
    width : 'toggle'
  });
  $('toggleTarget').css('display', 'flex');
});

function ReportToExcelConverter() {
  const d = new Date();
  $("#mainTable").table2excel({
    exclude: ".noExl",
    name: "Excel Document Name",
    filename: d.getMonth() + 1 + "월 자료" + '.xls', //확장자를 여기서 붙여줘야한다.
    fileext: ".xls",
    exclude_img: true,
    exclude_links: true,
    exclude_inputs: true
  });
};

let selectedGrade = getParameterByName('grade');
$('#gradeBox option:eq(' + selectedGrade + ')').attr('selected', "selected");

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
