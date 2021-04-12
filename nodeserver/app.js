const express = require('express');
const morgan = require('morgan');
const path = require('path');
const mysql = require('mysql');
const multer = require('multer');
const fs = require('fs');

//서버 설정
const app = express();
app.set('port', process.env.PORT || 80);

//로그 출력 설정
app.use(morgan('dev'));

//정적 파일 사용 설정
app.use(express.static('public'));

//post 방식의 파라미터 읽기
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
})); 

//파일 다운로드를 위한 설정 
var util = require('util')
var mime = require('mime')

//에러가 발생한 경우 처리
app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).send(err.message)
});

//파일 업로드를 위한 설정
//img 디렉토리를 연결
try {
	fs.readdirSync('public/img');
} catch (error) {
	console.error('img 폴더가 없으면 img 폴더를 생성합니다.');
	fs.mkdirSync('public/img');
}
//파일 이름은 기본 파일 이름에 현재 시간을 추가해서 생성
const upload = multer({
	storage: multer.diskStorage({
		destination(req, file, done) {
			done(null, 'public/img/');
		},
		filename(req, file, done) {
			const ext = path.extname(file.originalname);
			done(null, path.basename(file.originalname, ext) + Date.now() + ext);
		},
	}),
	limits: { fileSize: 10 * 1024 * 1024 },
});

var connection;
function connect(){
	connection = mysql.createConnection({
		host :'localhost',
		port : 3306,
		user : 'cyberadam',
		password : 'Dokki1025!',
		database:'cyberadam'
	});
	connection.connect(function(err) {
		if (err) {
			console.log('mysql connection error');
			console.log(err);
			throw err;
		}else{
			console.log('mysql connection success');
		}
	});
}

function close(){
	console.log('mysql connection close');
	connection.end();
}

app.get('/member/register', (req, res) => {
	  res.sendFile(path.join(__dirname, '/member/register.html'));
});

app.get('/member/idcheck', (req, res) => {
	//get 방식의 파라미터 가져오기
	const memberid = req.query.memberid;
	connect();
	connection.query('SELECT * FROM member where memberid=?', [memberid], function(err, results, fields) {
		if (err){
			throw err;
		}
		if(results[0]){
			res.json({'result':false}); 
		}else{
			res.json({'result':true}); 
		}
		close();
	});
});

app.get('/member/register', (req, res) => {
	  res.sendFile(path.join(__dirname, '/member/register.html'));
});

app.get('/member/idcheck', (req, res) => {
	//get 방식의 파라미터 가져오기
	const memberid = req.query.memberid;
	connect();
	connection.query('SELECT * FROM member where memberid=?', [memberid], function(err, results, fields) {
		if (err){
			throw err;
		}
		if(results[0]){
			res.json({'result':false}); 
		}else{
			res.json({'result':true}); 
		}
		close();
	});
});

app.get('/member/nicknamecheck', (req, res) => {
	//get 방식의 파라미터 가져오기
	const membernickname = req.query.membernickname;
	connect();
	connection.query('SELECT * FROM member where membernickname=?', [membernickname], function(err, results, fields) {
		if (err){
			throw err;
		}
		if(results[0]){
			res.json({'result':false}); 
		}else{
			res.json({'result':true}); 
		}
		close();
	});
});

app.post('/member/register', (req, res) => {
	//post 방식의 파라미터 가져오기
	const memberid = req.body.memberid;
	const memberpw = req.body.memberpw;
	const membernickname = req.body.membernickname;

	connect();
	connection.query('insert into member(memberid, memberpw, membernickname) values(?, ?, ?)',
			[memberid, memberpw, membernickname], function(err, results, fields) {
		if (err){
			throw err;
		}
		if(results.affectedRows == 1){
			res.json({'result':true}); 
		}else{
			res.json({'result':false}); 
		}
		close();
	});
});

app.get('/member/login', (req, res) => {
	  res.sendFile(path.join(__dirname, '/member/login.html'));
});

app.post('/member/login', (req, res) => {
	//post 방식의 파라미터 가져오기
	const memberid = req.body.memberid;
	const memberpw = req.body.memberpw;
	connect();
	connection.query('SELECT * FROM member where memberid = ? and memberpw=?', [memberid, memberpw], function(err, results, fields) {
		if (err)
			throw err;
		//데이터가 존재하지 않으면 result에 false를 출력 
		if(results.length == 0){
			res.json({'result':false}); 
		}
		//데이터가 존재하면 result에 true를 출력하고 데이터를 item에 출력
		else{
			res.json({'result':true, 'member':results[0]}); 
		}
		close();
	});
});

//전체 보기 페이지 이동
app.get('/item/all', (req, res) => {
	  res.sendFile(path.join(__dirname, '/item/all.html'));
});

//전체 데이터 가져오기
app.get('/item/getall', (req, res, next) => {
	connect();
	//전체 데이터 가져오기
	var list;
	connection.query('SELECT * FROM item order by itemid desc', function(err, results, fields) {
		if (err){
			throw err;
		}
		list = results;
		//전체 데이터 개수 가져오기
		connection.query('SELECT count(*) cnt FROM item', function(err, results, fields) {
			if (err)
				throw err;
			res.json({'count':results[0].cnt, 'list':list}); 
			close();
		});
	});
});

//상세보기 - itemid를 매개변수로 받아서 하나의 데이터를 찾아서 출력해주는 처리 
app.get('/item/detail', (req, res, next) => {
	itemid = req.params.itemid;
	res.sendFile(path.join(__dirname, '/item/detail.html'));
});

//상세보기 - itemid를 매개변수로 받아서 하나의 데이터를 찾아서 출력해주는 처리 
app.get('/item/getitem/:itemid', (req, res, next) => {
	var itemid = req.params.itemid;
	connect();
	connection.query('SELECT * FROM item where itemid = ?', itemid, function(err, results, fields) {
		if (err)
			throw err;
		//데이터가 존재하지 않으면 result에 false를 출력 
		if(results.length == 0){
			res.json({'result':false}); 
		}
		//데이터가 존재하면 result에 true를 출력하고 데이터를 item에 출력
		else{
			res.json({'result':true, 'item':results[0]}); 
		}
		close();
	});
});

//페이지 단위 보기 페이지 이동
app.get('/item/list', (req, res) => {
	  res.sendFile(path.join(__dirname, '/item/list.html'));
});

//페이지 단위 데이터 가져오기
app.get('/item/paging', (req, res, next) => {
	//get 방식의 파라미터 가져오기
	const pageno = req.query.pageno;
	const count = req.query.count;

	console.log(count);
	//데이터를 가져올 시작 위치와 데이터 개수 설정
	var start = 0
	var size = 15
	if(pageno != undefined){
		if(count != undefined){
			size = parseInt(count)
		}
		start = (pageno - 1) * size
	}
	
	//시작 위치와 페이지 당 데이터 개수를 설정해서 가져오기
	var list;
	connect();
	connection.query('SELECT * FROM item order by itemid desc limit ?, ?', [start, size], function(err, results, fields) {
		if (err){
			throw err;
		}
		list = results;
		//전체 데이터 개수 가져오기
		connection.query('SELECT count(*) cnt FROM item', function(err, results, fields) {
			if (err)
				throw err;
			res.json({'count':results[0].cnt, 'list':list}); 
			close();

		});
	});
});

app.get('/item/img/:fileid', function(req, res){
	var fileId = req.params.fileid;
	//프로젝트의 실제 디렉토리 이름을 설정
	var file = '/Users/adam/Documents/source/node/nodeserver/public/img' + '/' + fileId;
	console.log("file:" + file);
	mimetype = mime.lookup(fileId);
	console.log("file:" + mimetype);
	res.setHeader('Content-disposition', 'attachment; filename=' + fileId);
	res.setHeader('Content-type', mimetype);
	var filestream = fs.createReadStream(file);
	filestream.pipe(res);
});

var year;
var month;
var day;
var hour;
var minute;
var seconde;

function currentDay(){
	//현재 시간의 년월일 시분초 가져오기
    var date = new Date()
    year = date.getFullYear();
    month = (1 + date.getMonth());
    month = month >= 10 ? month : '0' + month;
    day = date.getDate();
    day = day >= 10 ? day : '0' + day;
    
    hour = date.getHours();
    hour = hour >= 10 ? hour : '0' + hour;
    minute = date.getMinutes();
    minute = minute >= 10 ? minute : '0' + minute;
    second = date.getSeconds();
    second = second >= 10 ? second : '0' + second;
}

function updateDate(){
	const writeStream = fs.createWriteStream('./update.txt');
	writeStream.write(year + '-' + month + '-' + day + " " + hour + ":" + minute + ":" + second);
	writeStream.end();
}

app.get('/item/insert', (req, res) => {
	  res.sendFile(path.join(__dirname, '/item/insert.html'));
});

//데이터 삽입:itemname, description, price, pictureurl(파일)을 받아서 처리
//itemid는 가장 큰 itemid를 찾아서 + 1
app.post('/item/insert', upload.single('pictureurl'), (req, res, next) => {
	//파라미터 가져오기
	const itemname = req.body.itemname;
	const description = req.body.description;
	const price = req.body.price;
	const membernickname = req.body.membernickname;
	
	var pictureurl;
	if(req.file){
		pictureurl = req.file.filename
	}else{
		pictureurl = "default.jpg";
	}
	connect();
	//가장 큰 itemid 가져오기
	connection.query('select max(itemid) maxid from item', function(err, results, fields) {
		if (err)
			throw err;
		var itemid;
		if(results.length > 0){
			itemid = results[0].maxid + 1
		}else{
			itemid = 1;
		}	    

		currentDay();
        //데이터 삽입
		connection.query('insert into item(itemid, itemname, price, description, pictureurl, updatedate, membernickname) values(?,?,?,?,?,?,?)', 
				[itemid, itemname, price, description, pictureurl,  year + '-' + month + '-' + day, membernickname], function(err, results, fields) {
			if (err)
				throw err;
			console.log(results)
			if(results.affectedRows == 1){
				updateDate();

				res.json({'result':true}); 
			}else{
				res.json({'result':false}); 
			}
			close();
		});
	});
});

app.get('/item/update', (req, res, next) => {
	res.sendFile(path.join(__dirname, '/item/update.html'));
});

//데이터 수정: itemid, itemname, description, price, oldpictureurl, pictureurl(파일)을 받아서 처리
app.post('/item/update', upload.single('pictureurl'), (req, res, next) => {
	//파라미터 가져오기
	const itemid = req.body.itemid;
	const itemname = req.body.itemname;
	const description = req.body.description;
	const price = req.body.price;
	const oldpictureurl = req.body.oldpictureurl;

	var pictureurl;
	if(req.file){
		pictureurl = req.file.filename
	}else{
		pictureurl = oldpictureurl;
	}
	
	connect();
	
	currentDay();
	//데이터 수정
	connection.query('update  item set itemname=?, price=?, description=?, pictureurl=?, updatedate=? where itemid=?', 
			[itemname, price, description, pictureurl,  year + '-' + month + '-' + day, itemid], function(err, results, fields) {
		if (err)
			throw err;
		if(results.affectedRows == 1){
			updateDate();

			res.json({'result':true}); 
		}else{
			res.json({'result':false}); 
		}
		close();
	});
});

app.post('/item/delete', (req, res, next) => {
	const itemid = req.body.itemid;
	console.log(itemid);
	currentDay();

	connect();
	connection.query('delete FROM item where itemid = ?', itemid, function(err, results, fields) {
		if (err)
			throw err;
		console.log(results)
		if(results.affectedRows == 1){
			updateDate();
			res.json({'result':true}); 
		}else{
			res.json({'result':false}); 
		}
		close();
	});
});

app.get('/item/lastupdatetime', (req, res, next) => {
	fs.readFile('./update.txt', function (err, data) { 
		res.json({'result':data.toString()}); 
	});
});


//서버 실행
app.listen(app.get('port'), () => {
	console.log(app.get('port'), '번 포트에서 대기 중');
});

app.get('/', (req, res) => {
	  res.sendFile(path.join(__dirname, '/index.html'));
})
