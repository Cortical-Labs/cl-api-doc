function createVisualiser(uniqueId, div)
{
    const canvas          = div.querySelector('canvas');
    const drawingContext  = canvas.getContext('2d', { alpha: true });

    const uiSpikeChannel  = div.querySelector('#latest-spike-channel');
    const uiBouncesLeft   = div.querySelector('#bounces-left');
    const uiBouncesRight  = div.querySelector('#bounces-right');
    const uiBouncesTop    = div.querySelector('#bounces-top');
    const uiBouncesBottom = div.querySelector('#bounces-bottom');
    const uiBouncesCorner = div.querySelector('#bounces-corner');

    let latestData;
    let attributes;
    let latestSpike;
    
    function reset()
    {
        //
        // Reset the visualisation to its initial state.
        //
        // This function is called when the visualisation system is reset, and is also called
        // when the visualisation is first created.
        //

        latestData = null;
        attributes = null;
    }

    function updateBouncesUi()
    {
        uiBouncesLeft.textContent   = attributes.bounces_left;
        uiBouncesRight.textContent  = attributes.bounces_right;
        uiBouncesTop.textContent    = attributes.bounces_top;
        uiBouncesBottom.textContent = attributes.bounces_bottom;
        uiBouncesCorner.textContent = attributes.bounces_corner;
    }

    function attributesReset(dataStreamName, initialAttributes)
    {
        if (dataStreamName == 'gameplay')
        {
            attributes = initialAttributes;
            updateBouncesUi();
        }
    }

    function attributesUpdated(dataStreamName, updatedAttributes)
    {
        if (dataStreamName == 'gameplay')
        {
            attributes = { ...attributes, ...updatedAttributes };
            updateBouncesUi();
        }
    }

    function process(dataStreamName, timestamp, data)
    {
        //
        // Called for EVERY (timestamp, data) pair in the data stream.
        //
        // Use this to modify any global state needed by draw().
        //
        
        if (dataStreamName == 'gameplay')
        {
            latestData = data;
            return;
        }
        
        if (dataStreamName == 'cl_spikes')
        {
            latestSpike = data;
            uiSpikeChannel.innerText = data.channel;
        }
    }

    function draw()
    {
        //
        // Render the latest data.
        //
        // This function is NOT necessarily called for every
        // (timestamp, data) pair in the data stream - it is called
        // only when the visualisation system needs a new image to
        // display, and is always passed the most recent
        // (timestamp, data) pair.
        //

        if (attributes)
            if (canvas.width != attributes.game_width || canvas.height != attributes.game_height)
            {
                canvas.width  = attributes.game_width;
                canvas.height = attributes.game_height;
            }

        drawingContext.clearRect(0, 0, canvas.width, canvas.height);
        
        if (latestSpike)
        {
            //
            // Draw the most recent spike
            //
            
            drawingContext.strokeStyle = 'lightblue';
            const halfY = canvas.height / 2;
            
            drawingContext.beginPath();
            
            for (let sample = 0; sample < 75; sample++)
            {
                const x = (canvas.width - 1) * sample / 74;
                const y = halfY + (latestSpike.samples[sample] / 4);
                
                if (sample == 0)
                    drawingContext.moveTo(x, y);
                else
                    drawingContext.lineTo(x, y);
            }
            
            drawingContext.stroke();
        }
        
        if (latestData && attributes)
        {
            //
            // Draw the ball
            //
            
            drawingContext.fillStyle = 'white';
            drawingContext.fillRect(
                latestData.x - attributes.ball_width  / 2,
                latestData.y - attributes.ball_height / 2,
                attributes.ball_width,
                attributes.ball_height);
        }
    }

    return  {
                // Settings
                bufferMs: 1000 / 60 * 1,

                // Functions
                reset,
                attributesReset,    // Optional
                attributesUpdated,  // Optional
                process,
                draw
            };
}