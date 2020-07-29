//To don't write history excepct root page
document.querySelectorAll('.navButton').forEach(item => {
  item.addEventListener('click', event => {
    if(document.location.pathname === '/'){
      location.href = event.target.id;
    }else{
      location.replace(event.target.id);
    }
  })
});

//To toggle nav bar
$('.toggle').click(function(){
  $('.toggleTarget').animate({
    width : 'toggle'
  });
  $('toggleTarget').css('display', 'flex');
});

//to excel function
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

//to maintain status of select box
let selectedGrade = getParameterByName('grade');
$('#gradeBox option:eq(' + selectedGrade + ')').attr('selected', "selected");

//to get status of select box
function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
