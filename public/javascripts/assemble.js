//To don't write history excepct root page
document.querySelectorAll('.navButton').forEach((item) => {
  item.addEventListener('click', (event) => {
    if (document.location.pathname === '/') {
      location.href = event.target.id;
    } else {
      location.replace(event.target.id);
    }
  });
});

//excel download
let tableToExcel = function (tableId, title) {
  let tableData = document.getElementById(tableId);
  let workbook = XLSX.utils.table_to_book(tableData, { sheet: 'Sheet 1' });
  XLSX.writeFile(workbook, (title || 'no Title') + '.xlsx');
};

//To toggle nav bar
$('.toggle').click(function () {
  $('.toggleTarget').animate({
    width: 'toggle',
  });
  $('toggleTarget').css('display', 'flex');
});

//to maintain status of select box
let selectedGrade = getParameterByName('grade');
$('#gradeBox option:eq(' + selectedGrade + ')').attr('selected', 'selected');

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
