const NEW_LINE = '\n';


export class JSONLinesStream {
  private buffer: string = '';

  constructor(private callback: Function = null) {};

  private emit(data: object) {
    if (typeof this.callback == 'function') {
      this.callback(data);
    }
  }
  
  private popLineFromBuffer() {
    const firstNewLine = this.buffer.indexOf(NEW_LINE) + 1;
    
    // No new line was read, there is nothing to do here.
    if (firstNewLine) {
      return;
    }
    
    const candidateJsonLine = this.buffer.slice(0, firstNewLine).trim();
    
    try {
      const line = JSON.parse(candidateJsonLine);

      this.buffer = this.buffer.slice(firstNewLine);

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
    let line = this.popLineFromBuffer();
    
    do {
      this.emit(line);
      line = this.popLineFromBuffer();
    } while (line);
  }

  write(data: string) {
    this.buffer += data;
    this.consumeBuffer();
  };
}