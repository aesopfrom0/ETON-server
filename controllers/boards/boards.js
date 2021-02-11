const { boards, users, board_user } = require('../../models');
// const board_user = require('../../models/board_user');
// const users = require('../../models/users');

const {
	generateAccessToken,
	generateRefreshToken,
	sendRefreshToken,
	sendAccessToken,
	isAuthorized,
} = require('../tokenFunctions');

module.exports = {
	getAllBoard: async (req, res) => {
		// console.log(req.headers);
		console.log("req : ", req.query);

		let sql = `select b.id as boardID, b.admin_userid, b.title, b.prg_priority 
              from boards as b 
              left join board_users as bu 
                on b.id = bu.board_id 
              where bu.user_id=1`

		if (req.headers["authorization"]) {
			// let allBoardsInfo = await users.findByPk(1, {include : ['userId']})
			let getAllBoard = await users.findAll({
				where: { id: req.query.user_id },
				include: [
					{ model: boards },
				]
			})
			if (getAllBoard) {

				// console.log("allBoards : ",getAllBoard[0].dataValues.boards);
				// console.log("allBoards : ",getAllBoard);
				let boardList = [];
				getAllBoard[0].dataValues.boards.forEach(el => {
					let eachBoardInfo = {
						id: el.dataValues.id,
						title: el.dataValues.title,
						admin_userid: el.dataValues.admin_userid,
						prg_priority: el.dataValues.prg_priority
					};
					boardList.push(eachBoardInfo);
				})
				res
					.status(200)
					.send({
						message: 'ok',
						data: {
							boardList
						}
					})
			} else {
				res
					.status(404)
					.send({
						message: 'Not Found.'
					})
			}
		} else {
			res
				.status(403)
				.send({
					message: 'Invalid access token.'
				})
		}


	},

	createNewBoard: async (req, res) => {

		console.log("createNewBoard - req.body : ", req.body);
		if (req.headers["authorization"]) {
			let parsed = isAuthorized(req);

			console.log("@@@@@@parsed : ", parsed);

			let board_id;
			let newBoardInfo = await boards.create({
				admin_userid: parsed.id,
				title: req.body.title
			})
			.then(result => {
				board_id = result.dataValues.id;
				board_user.create({
					board_id,
					user_id : Number(parsed.id)
				})
			.then(result => {
				// console.log("res2 : ", result);
				console.log("board_id : ", board_id);
				res
					.status(200)
					.send({
						id : board_id,
						message : "Created"
					})
			})
			.catch(err => {
				console.log("err2 : ", err);
			})
		})
		.catch(err => {
			console.log("err1 : ", err);
			res
				.status(404)
				.send({
					message : "create failed"
				})
		})

		}else{
			res
				.status(403)
				.send({
					message : "Invalid access token."
				})
		}

	}
}
