const express = require('express');
const uuid = require('uuid');
const Ajv = require('ajv');

const DB = require('../db'); // chooses provider automatically
const ajv = new Ajv();

const router = express.Router();

const createSchema = { type: 'object', properties: { title: { type: 'string', minLength: 1 }}, required: ['title'], additionalProperties: false };
const validateCreate = ajv.compile(createSchema);

// list
router.get('/', async (req, res) => {
  try {
    const list = await DB.listTodos();
    res.json(list);
  } catch (err) {
    req.log.error({ err }, 'Failed list todos');
    res.status(500).json({ error: 'internal' });
  }
});

// create
router.post('/', async (req, res) => {
  const ok = validateCreate(req.body);
  if (!ok) {
    return res.status(400).json({ error: 'invalid_payload', details: validateCreate.errors });
  }

  const item = {
    id: uuid.v4(),
    title: req.body.title,
    done: false
  };

  try {
    const created = await DB.createTodo(item);
    res.status(201).json(created);
  } catch (err) {
    req.log.error({ err }, 'Failed create todo');
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;

