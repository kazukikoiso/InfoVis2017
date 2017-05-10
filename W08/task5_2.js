// sample_035
//
// WebGL�ǥȥ�����������

// canvas �ȥ��������˥���򥰥��Х�˰���
var c;
var q = new qtnIV();
var qt = q.identity(q.create());

// �ޥ����ࡼ�֥��٥�Ȥ���Ͽ�������
function mouseMove(e){
	var cw = c.width;
	var ch = c.height;
	var wh = 1 / Math.sqrt(cw * cw + ch * ch);
	var x = e.clientX - c.offsetLeft - cw * 0.5;
	var y = e.clientY - c.offsetTop - ch * 0.5;
	var sq = Math.sqrt(x * x + y * y);
	var r = sq * 2.0 * Math.PI * wh;
	if(sq != 1){
		sq = 1 / sq;
		x *= sq;
		y *= sq;
	}
	q.rotate(r, [y, x, 0.0], qt);
}

onload = function(){
	// canvas������Ȥ����
	c = document.getElementById('canvas');
	c.width = 500;
	c.height = 300;
	
	// ���٥�Ƚ���
	c.addEventListener('mousemove', mouseMove, true);
	
	// webgl����ƥ����Ȥ����
	var gl = c.getContext('webgl') || c.getContext('experimental-webgl');
	
	// ĺ�����������ȥե饰���ȥ�������������
	var v_shader = create_shader('vs');
	var f_shader = create_shader('fs');
	
	// �ץ���४�֥������Ȥ������ȥ��
	var prg = create_program(v_shader, f_shader);
	
	// attributeLocation������˼���
	var attLocation = new Array();
	attLocation[0] = gl.getAttribLocation(prg, 'position');
	attLocation[1] = gl.getAttribLocation(prg, 'normal');
	attLocation[2] = gl.getAttribLocation(prg, 'color');
	
	// attribute�����ǿ�������˳�Ǽ
	var attStride = new Array();
	attStride[0] = 3;
	attStride[1] = 3;
	attStride[2] = 4;
	
	// ���Υ�ǥ�
	var sphereData    = sphere(64, 64, 1.5);
	var sPosition     = create_vbo(sphereData.p);
	var sNormal       = create_vbo(sphereData.n);
	var sColor        = create_vbo(sphereData.c);
	var sVBOList      = [sPosition, sNormal, sColor];
	var sIndex        = create_ibo(sphereData.i);
	
	// �ȡ��饹��ǥ�
	var torusData     = torus(64, 64, 0.5, 2.5)
	var tPosition     = create_vbo(torusData.p);
	var tNormal       = create_vbo(torusData.n);
	var tColor        = create_vbo(torusData.c);
	var tVBOList      = [tPosition, tNormal, tColor];
	var tIndex        = create_ibo(torusData.i);
	
	// uniformLocation������˼���
	var uniLocation = new Array();
	uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
	uniLocation[1] = gl.getUniformLocation(prg, 'invMatrix');
	uniLocation[2] = gl.getUniformLocation(prg, 'lightDirection');
	uniLocation[3] = gl.getUniformLocation(prg, 'texture');
	uniLocation[4] = gl.getUniformLocation(prg, 'edge');
	uniLocation[5] = gl.getUniformLocation(prg, 'edgeColor');
	
	// �Ƽ����������Ƚ����
	var m = new matIV();
	var mMatrix   = m.identity(m.create());
	var vMatrix   = m.identity(m.create());
	var pMatrix   = m.identity(m.create());
	var tmpMatrix = m.identity(m.create());
	var mvpMatrix = m.identity(m.create());
	var invMatrix = m.identity(m.create());
	
	// �ƥ��������Ϣ
	var texture = null;
	create_texture('toon.png');
	gl.activeTexture(gl.TEXTURE0);
	
	// ʿ�Ը����θ���
	var lightDirection = [-0.5, 0.5, 0.5];
	
	// �����󥿤����
	var count = 0;
	
	// ���٥ƥ��Ȥ�ͭ���ˤ���
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	
	// ����󥰤�ͭ���ˤ���
	gl.enable(gl.CULL_FACE);
	
	// ���å��ο�
	var edgeColor = [0.0, 0.0, 0.0, 1.0];
	
	// ����롼��
	(function(){
		// canvas������
		gl.clearColor(0.0, 0.7, 0.7, 1.0);
		gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		// �����󥿤򥤥󥯥���Ȥ���
		count++;
		
		// �����󥿤򸵤˥饸����򻻽�
		var rad = (count % 360) * Math.PI / 180;
		
		// �ƥ�������ΥХ����
		gl.bindTexture(gl.TEXTURE_2D, texture);
		
		// �ӥ塼�ߥץ�����������ɸ�Ѵ�����
		var eyePosition = new Array();
		var camUpDirection = new Array();
		q.toVecIII([0.0, 0.0, 10.0], qt, eyePosition);
		q.toVecIII([0.0, 1.0, 0.0], qt, camUpDirection);
		m.lookAt(eyePosition, [0, 0, 0], camUpDirection, vMatrix);
		m.perspective(45, c.width / c.height, 0.1, 100, pMatrix);
		m.multiply(pMatrix, vMatrix, tmpMatrix);
		
		// �ȡ��饹������
		set_attribute(tVBOList, attLocation, attStride);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndex);
		m.identity(mMatrix);
		m.rotate(mMatrix, rad, [0, 1, 1], mMatrix);
		m.multiply(tmpMatrix, mMatrix, mvpMatrix);
		m.inverse(mMatrix, invMatrix);
		gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
		gl.uniform3fv(uniLocation[2], lightDirection);
		gl.uniform1i(uniLocation[3], 0);
		
		// ��ǥ��������
		gl.cullFace(gl.BACK);
		gl.uniform1i(uniLocation[4], false);
		edgeColor = [0.0, 0.0, 0.0, 0.0];
		gl.uniform4fv(uniLocation[5], edgeColor);
		gl.drawElements(gl.TRIANGLES, torusData.i.length, gl.UNSIGNED_SHORT, 0);
		
		// ���å��ѥ�ǥ��������
		gl.cullFace(gl.FRONT);
		gl.uniform1i(uniLocation[4], true);
		edgeColor = [0.0, 0.0, 0.0, 1.0];
		gl.uniform4fv(uniLocation[5], edgeColor);
		gl.drawElements(gl.TRIANGLES, torusData.i.length, gl.UNSIGNED_SHORT, 0);
		
		// ���Τ�����
		set_attribute(sVBOList, attLocation, attStride);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sIndex);
		m.identity(mMatrix);
		m.multiply(tmpMatrix, mMatrix, mvpMatrix);
		m.inverse(mMatrix, invMatrix);
		gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
		
		// ��ǥ��������
		gl.cullFace(gl.BACK);
		gl.uniform1i(uniLocation[4], false);
		edgeColor = [0.0, 0.0, 0.0, 0.0];
		gl.uniform4fv(uniLocation[5], edgeColor);
		gl.drawElements(gl.TRIANGLES, sphereData.i.length, gl.UNSIGNED_SHORT, 0);
		
		// ���å��ѥ�ǥ��������
		gl.cullFace(gl.FRONT);
		gl.uniform1i(uniLocation[4], true);
		edgeColor = [0.0, 0.0, 0.0, 1.0];
		gl.uniform4fv(uniLocation[5], edgeColor);
		gl.drawElements(gl.TRIANGLES, sphereData.i.length, gl.UNSIGNED_SHORT, 0);
		
		// ����ƥ����Ȥκ�����
		gl.flush();
		
		// �롼�פΤ���˺Ƶ��ƤӽФ�
		setTimeout(arguments.callee, 1000 / 30);
	})();
	
	// ������������������ؿ�
	function create_shader(id){
		// �����������Ǽ�����ѿ�
		var shader;
		
		// HTML����script�����ؤλ��Ȥ����
		var scriptElement = document.getElementById(id);
		
		// script������¸�ߤ��ʤ�����ȴ����
		if(!scriptElement){return;}
		
		// script������type°��������å�
		switch(scriptElement.type){
			
			// ĺ�����������ξ��
			case 'x-shader/x-vertex':
				shader = gl.createShader(gl.VERTEX_SHADER);
				break;
				
			// �ե饰���ȥ��������ξ��
			case 'x-shader/x-fragment':
				shader = gl.createShader(gl.FRAGMENT_SHADER);
				break;
			default :
				return;
		}
		
		// �������줿���������˥������������Ƥ�
		gl.shaderSource(shader, scriptElement.text);
		
		// ���������򥳥�ѥ��뤹��
		gl.compileShader(shader);
		
		// ��������������������ѥ��뤵�줿�������å�
		if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
			
			// �������Ƥ����饷���������֤��ƽ�λ
			return shader;
		}else{
			
			// ���Ԥ��Ƥ����饨�顼���򥢥顼�Ȥ���
			alert(gl.getShaderInfoLog(shader));
		}
	}
	
	// �ץ���४�֥������Ȥ������������������󥯤���ؿ�
	function create_program(vs, fs){
		// �ץ���४�֥������Ȥ�����
		var program = gl.createProgram();
		
		// �ץ���४�֥������Ȥ˥��������������Ƥ�
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		
		// ������������
		gl.linkProgram(program);
		
		// ���������Υ�󥯤��������Ԥʤ�줿�������å�
		if(gl.getProgramParameter(program, gl.LINK_STATUS)){
		
			// �������Ƥ�����ץ���४�֥������Ȥ�ͭ���ˤ���
			gl.useProgram(program);
			
			// �ץ���४�֥������Ȥ��֤��ƽ�λ
			return program;
		}else{
			
			// ���Ԥ��Ƥ����饨�顼���򥢥顼�Ȥ���
			alert(gl.getProgramInfoLog(program));
		}
	}
	
	// VBO����������ؿ�
	function create_vbo(data){
		// �Хåե����֥������Ȥ�����
		var vbo = gl.createBuffer();
		
		// �Хåե���Х���ɤ���
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		
		// �Хåե��˥ǡ����򥻥å�
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
		
		// �Хåե��ΥХ���ɤ�̵����
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		
		// �������� VBO ���֤��ƽ�λ
		return vbo;
	}
	
	// VBO��Х���ɤ���Ͽ����ؿ�
	function set_attribute(vbo, attL, attS){
		// �����Ȥ��Ƽ�����ä�������������
		for(var i in vbo){
			// �Хåե���Х���ɤ���
			gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
			
			// attributeLocation��ͭ���ˤ���
			gl.enableVertexAttribArray(attL[i]);
			
			// attributeLocation�����Τ���Ͽ����
			gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
		}
	}
	
	// IBO����������ؿ�
	function create_ibo(data){
		// �Хåե����֥������Ȥ�����
		var ibo = gl.createBuffer();
		
		// �Хåե���Х���ɤ���
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
		
		// �Хåե��˥ǡ����򥻥å�
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
		
		// �Хåե��ΥХ���ɤ�̵����
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		
		// ��������IBO���֤��ƽ�λ
		return ibo;
	}
	
	// �ƥ����������������ؿ�
	function create_texture(source){
		// ���᡼�����֥������Ȥ�����
		var img = new Image();
		
		// �ǡ����Υ�����ɤ�ȥꥬ���ˤ���
		img.onload = function(){
			// �ƥ������㥪�֥������Ȥ�����
			var tex = gl.createTexture();
			
			// �ƥ��������Х���ɤ���
			gl.bindTexture(gl.TEXTURE_2D, tex);
			
			// �ƥ�������إ��᡼����Ŭ��
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
			
			// �ߥåץޥåפ�����
			gl.generateMipmap(gl.TEXTURE_2D);
			
			// �ƥ�������ѥ�᡼��������
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			
			// ���������ƥ���������ѿ�������
			texture = tex;
			
			// �ƥ�������ΥХ���ɤ�̵����
			gl.bindTexture(gl.TEXTURE_2D, null);
		};
		
		// ���᡼�����֥������ȤΥ����������
		img.src = source;
	}
	
};
