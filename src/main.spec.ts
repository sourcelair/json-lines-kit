import * as chai from 'chai';
import * as spies from 'chai-spies';
import 'mocha';

import { JSONLinesStream } from './main';


chai.use(spies);


describe('JSONLinesStream', () => {
  it('Should parse a JSON object in a chunk', () => {
    const chunk = '{"a": "b"}\n';
    const data = {a: 'b'};
    const spy = chai.spy();
    const parser = new JSONLinesStream(spy);

    parser.write(chunk);
    chai.expect(spy).to.have.been.called.once;
    chai.expect(spy).to.have.been.called.with(data);
  });
  
  it('Should parse a **nasty** JSON object in a chunk', () => {
    const chunk = '{"a": "b\\n"}\n';
    const data = {'a': 'b\n'};
    const spy = chai.spy();
    const parser = new JSONLinesStream(spy);

    parser.write(chunk);
    chai.expect(spy).to.have.been.called.once;
    chai.expect(spy).to.have.been.called.with(data);
  });

  it('Should **not** parse a simple JSON object without line feed', () => {
    const chunk = '{"a": "b"}';
    const spy = chai.spy();
    const parser = new JSONLinesStream(spy);

    parser.write(chunk);
    chai.expect(spy).to.have.been.called.exactly(0);
  });

  it('Should parse a JSON object broken in two chunks', () => {
    const chunk_1 = '{"a": "';
    const chunk_2 = 'b"}\n';
    const data = {a: 'b'};
    const spy = chai.spy();
    const parser = new JSONLinesStream(spy);

    parser.write(chunk_1);
    parser.write(chunk_2);
    chai.expect(spy).to.have.been.called.once;
    chai.expect(spy).to.have.been.called.with(data);
  });

  it('Should parse a JSON object broken in two **dirty** chunks', () => {
    const chunk_1 = '{"a": "';
    const chunk_2 = 'b"}\n{"next": "inco';
    const data = {a: 'b'};
    const spy = chai.spy();
    const parser = new JSONLinesStream(spy);

    parser.write(chunk_1);
    parser.write(chunk_2);
    chai.expect(spy).to.have.been.called.once;
    chai.expect(spy).to.have.been.called.with(data);
  });

  it('Should parse two **dirty** JSON objects broken in three **dirty** chunks', () => {
    const chunk_1 = '{"a": "';
    const chunk_2 = 'b"}\n\n{"next": "inco';  // Notice the two line breaks
    const chunk_3 = 'ming\\n"}\n{"what';  // Notice the escaped line break
    const data_1 = {a: 'b'};
    const data_2 = {next: 'incoming\n'};
    const spy = chai.spy();
    const parser = new JSONLinesStream(spy);

    parser.write(chunk_1);
    parser.write(chunk_2);
    parser.write(chunk_3);
    chai.expect(spy).to.have.been.called.twice;
    chai.expect(spy).to.have.been.first.called.with(data_1);
    chai.expect(spy).to.have.been.second.called.with(data_2);
  });
});