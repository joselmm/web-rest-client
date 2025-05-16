
$(document).ready(function() {
  // Al cargar la página, recupera los datos guardados
  loadFromLocalStorage();

  $('#requestForm').submit(function(e) {
    e.preventDefault();

    // Lee valores del formulario
    var requestForm = $('#requestForm');
    var method = requestForm.find('#methodSelect').val();
    var url = requestForm.find('#urlInput').val();
    var data = requestForm.find('#dataTextArea').val();
    var jsonData = data !== "" ? $.parseJSON(data) : {};

    var headers = {};
    var headersArr = [];
    var headersCounter = parseInt($('#headersCounter').val());
    for (var i = 1; i <= headersCounter; i++) {
      var name = requestForm.find('#headerNameInput' + i).val();
      var value = requestForm.find('#headerValueInput' + i).val();
      if (name !== "" && value !== "") {
        headers[name] = value;
        headersArr.push({ name: name, value: value });
      }
    }

    console.log('Sending ' + method + ' request to ' + url);

    // Guarda en localStorage
    saveToLocalStorage(method, url, data, headersArr);

    $.ajax({
        type: method,
        url: url,
        data: jsonData,
        headers: headers
      })
      .done(function(response) {
        $("#response").html(prettifyJSON(response));
        $("#responseStatus").text('200 OK');
      })
      .fail(function(jqXHR) {
        var err = jqXHR.responseText ? JSON.parse(jqXHR.responseText) : { error: 'Unknown' };
        $("#response").html(prettifyJSON(err));
        $("#responseStatus").text(jqXHR.status + ' ' + jqXHR.statusText);
      });
  });

  $('#addHeaderButton').click(function() {
    addHeaderInput();
  });

  // -- Funciones auxiliares --

  function prettifyJSON(json) {
    return JSON.stringify(json, undefined, 4)
      .replace(/\n/g,'<br/>')
      .replace(/\s/g,'&nbsp;');
  }

  function saveToLocalStorage(method, url, data, headersArr) {
    localStorage.setItem('last_method', method);
    localStorage.setItem('last_url', url);
    localStorage.setItem('last_data', data);
    localStorage.setItem('last_headers', JSON.stringify(headersArr));
    localStorage.setItem('last_headersCount', headersArr.length);
  }

  function loadFromLocalStorage() {
    var m = localStorage.getItem('last_method');
    var u = localStorage.getItem('last_url');
    var d = localStorage.getItem('last_data');
    var h = localStorage.getItem('last_headers');
    var hc = localStorage.getItem('last_headersCount');

    if (m) $('#methodSelect').val(m);
    if (u) $('#urlInput').val(u);
    if (d) $('#dataTextArea').val(d);

    // Si había headers guardados, reconstruye los inputs
    var headersArr = h ? JSON.parse(h) : [];
    if (headersArr.length > 0) {
      // Resetea cualquier header extra
      $('#headersCounter').val(0);
      $('.form-row').has('input[id^="headerNameInput"]').remove();

      headersArr.forEach(function(header, idx) {
        addHeaderInput(header.name, header.value);
      });
    }
  }

  function addHeaderInput(name, value) {
    var headersCounter = parseInt($('#headersCounter').val());
    headersCounter++;
    $('#headersCounter').val(headersCounter);

    var headerNameInput = $("<input>")
      .attr('type', 'text')
      .attr('placeholder', 'Authorization')
      .attr('id', 'headerNameInput' + headersCounter)
      .attr('class', 'form-control col-md-6')
      .val(name || '');

    var headerValueInput = $("<input>")
      .attr('type', 'text')
      .attr('placeholder', 'Bearer XYZ')
      .attr('id', 'headerValueInput' + headersCounter)
      .attr('class', 'form-control col-md-6')
      .val(value || '');

    var headerFormGroup = $("<div></div>")
      .attr('class', 'form-row')
      .append(
        $("<div></div>").attr('class', 'form-group col-md-6').append(headerNameInput),
        $("<div></div>").attr('class', 'form-group col-md-6').append(headerValueInput)
      );

    $('#addHeaderButton').closest('.form-row').before(headerFormGroup);
  }

});
