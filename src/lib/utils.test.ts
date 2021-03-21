import {quotes} from './utils';

test('quotes() adds quotes correctly', () => {
    expect(quotes('hey')).toBe('"hey"');
});
