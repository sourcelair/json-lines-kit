export class JSONLinesStream {
  private buffer: string = '';

  constructor(private callback: Function = null) {};

  private emit(data: object) {
    if (typeof this.callback == 'function') {
      this.callback(data);
    }
  }
  
  private popLineFromBuffer() {
    // What we call here a "New Line Cluster" is multiple consecutive new lines (\n) together
    const firstNewLineCluster = this.buffer.match(/(\n+)/);
    
    // No new line cluster was read, there is nothing to do here.
    if (!firstNewLineCluster) {
      return null;
    }
    
    const firstNewLineBreakPoint = firstNewLineCluster.index + firstNewLineCluster[1].length;
    const candidateJsonLine = this.buffer.slice(0, firstNewLineBreakPoint).trim();
    
    try {
      const line = JSON.parse(candidateJsonLine);

      this.buffer = this.buffer.slice(firstNewLineBreakPoint);

      return line;
    } catch (e) {
      const normalizedMessage = e.message.toLowerCase();
      
      // If data did not stop unexpectedely, empty the buffer, or else
      // just wait for the next batch. 
      if (!normalizedMessage.startsWith('unexpected end of data')) {
        this.buffer = '';
      }
      
      return null;
    }
    
  }

  private consumeBuffer() {
    let line;

    do {
      line = this.popLineFromBuffer();
      
      if (line) {
        this.emit(line);
      }
    } while (line);
  }

  write(data: string) {
    this.buffer += data;
    this.consumeBuffer();
  };
}