import * as chai from 'chai';
import * as request from 'supertest';
import * as express from 'express';
import { server } from './app';

const app = server.app;
const expect = chai.expect;
request(app).post('/creategame').expect(200)