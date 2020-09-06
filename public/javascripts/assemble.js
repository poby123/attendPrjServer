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

//get parameter from url
function getParam(sname) {
  var params = location.search.substr(location.search.indexOf("?") + 1);
  var sval = "";
  params = params.split("&");
  for (var i = 0; i < params.length; i++) {
    temp = params[i].split("=");
    if ([temp[0]] == sname) { sval = temp[1]; }
  }
  return sval;
}
