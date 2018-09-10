const { Router } = require('express');
const createError = require('http-errors');
const handleAsync = require('../utils/handle-async');

const router = Router();

router.route('/:id')
  .get(handleAsync(async (req, res, next) => {
    if (!isNumber(req.params['id'])) {
        return next(
          createError(400, 'bad request: game id must be numeric'));
      }

    const exists = await req.db.getAsync(`SELECT 1 FROM games WHERE id=?`, [req.params['id']]);
    if (!exists) {
      return next(
        createError(404,
          `not found: game with id ${req.params['id']} doesn't exist`));
    }

    const data = await req.db.allAsync(`SELECT killer, victim, mean_of_death FROM game_kills WHERE game_id = ?`, [req.params['id']]);
    return res.send({
      status: 200,
      message: 'ok',
      data: format(data),
    });
  }));

module.exports = router;

function isNumber(value) {
  const num = value.trim();
  if (num === '') return false;

  return isFinite(value);
}

function format(kills) {
  return kills.reduce((game, { killer, victim, mean_of_death }) => {
    game.total_kills++; // add kill to total counter

    if (!game.kill_by_means[mean_of_death])
      game.kill_by_means[mean_of_death] = 0; // set property if not exists
    game.kill_by_means[mean_of_death]++; // then increment it

    if (killer !== '<world>') {
      if (!game.kills[killer]) // set property if not found
        game.kills[killer] = 0;
      game.kills[killer]++;

      if (!game.players.includes(killer))
        game.players.push(killer);
    } else { // if killed by <world>, victim gets -1 kill
      if (!game.kills[victim])
       game.kills[victim] = 0;
      game.kills[victim]--;
    }

    // if victim has not been included yet, do it
    if (!game.players.includes(victim))
      game.players.push(victim);

    return game;
  }, {
    total_kills: 0,
    players: [],
    kills: {},
    kill_by_means: {},
  });
}
