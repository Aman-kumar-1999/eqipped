var http = require('http'),
    fs = require('fs'),
    ccav = require('./ccavutil.js'),
    qs = require('querystring');

	exports.postReq = function(request,response){
		var body = '',
		workingKey = '13DB58FE19D7C6CDF6A3187326352027',	// localhost working key.
		// workingKey = '0745DFF637295D9271DD0C2CFC3ECC13',	// eqipped.com working key .
		// accessCode = 'AVHU13JG47CI18UHIC',			// access key eqipped.com .
		accessCode = 'AVKS04JH38AH50SKHA',			// access key localhost .

		encRequest = '',
		formbody = '';
					
		
		body += qs.stringify(request.body);
		// console.log(body);
		encRequest = ccav.encrypt(body,workingKey); 
		formbody = '<form id="nonseamless" method="post" name="redirect" action="https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction"/> <input type="hidden" id="encRequest" name="encRequest" value="' + encRequest + '"><input type="hidden" name="access_code" id="access_code" value="' + accessCode + '"><script language="javascript">document.redirect.submit();</script></form>';
	
					
	
		response.writeHeader(200, {"Content-Type": "text/html"});
		response.write(formbody);
		response.end();
	
	   return; 
	};
