  /*
  Place this code inside App() to create dataset yourselve

  const landmarkNames = [
    "wrist",
    "thumb_cmc", "thumb_mcp", "thumb_ip", "thumb_tip",
    "index_mcp", "index_pip", "index_dip", "index_tip",
    "middle_mcp", "middle_pip", "middle_dip", "middle_tip",
    "ring_mcp", "ring_pip", "ring_dip", "ring_tip",
    "pinky_mcp", "pinky_pip", "pinky_dip", "pinky_tip"
  ];

  // here you have all the labels that will indicate the first row of dataset csv file
  const header = [
    "label",
    "handedness",
    "handedness_score",
    "palm_nx",  // normale rotazione X
    "palm_ny",  // normale rotazione Y
    "palm_nz",  // normale rotazione Z
    ...landmarkNames.flatMap(name => [`${name}_x`, `${name}_y`, `${name}_z`])
  ];

  const currentLabel = useRef(null);
  const collectedRows = useRef([]);
  const rowRef = useRef(null);

  // any key below is associated to a label, the label is associated then to what you show to the camera

  useEffect(() => {
    const onKey = (e) => {
      switch (e.key.toLowerCase()) {
        case 'u':
          currentLabel.current = 'thumbs_up';
          break;
        case 'd':
          currentLabel.current = 'thumbs_down';
          break;
        case 'l':
          currentLabel.current = 'thumb_left';
          break;
        case 'r':
          currentLabel.current = 'thumb_right';
          break;
        case 'p':
          currentLabel.current = 'open_hand';
          break;
        case 'f':
          currentLabel.current = 'fist';
          break;
        case 'k':
          currentLabel.current = 'ok'
          break;
        case 'o':
          currentLabel.current = 'other';
          break;
        case 'v':
          currentLabel.current = 'negation';
          break;
        default:
          currentLabel.current = null;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  inside mediapipe hands initialization place the following code to create dataset

      //console.log(collectedRows.current.length);
      // use this only for dataset creation
      if(currentLabel.current && !(collectedRows.current.length > 2999)) { // we'll have 3000 rows for each hand
        // we flatten the 21 points [x,y,z,...]
        const flat = normalizeLandmarks(lm) // length 63

        // extract handedness from MediaPipe
        let handedness = results.multiHandedness[0].label;   // "Left" or "Right"
        const score      = results.multiHandedness[0].score;   // 0–1

        if(score >= HANDNESS_SCORE_THRESH) {
          // we invert handedness result since it's mirrored from camera
          handedness = handedness === "Left" ? "Right" : "Left";

          const HAND_USED_IN_TRAINING = "Right" // we define which hand we are using for this class

          if(handedness === HAND_USED_IN_TRAINING) {

            // normale al palmo
            const palmNormal = computePalmNormal(lm); // [nx, ny, nz]

            if(!isHandStable(palmNormal)) {
              console.log("FRAME NOT STABLE -- NOT SAVED");
              return;
            }
            
            // landmark normalizzati
            const normFlat = normalizeLandmarks(lm);  // array length = 63

            // we build the current row with label, handedness, score, and lastly the 63 array values
        
            // row = label, handedness, score, palmNormal, normFlat
            const row = [
              currentLabel.current,
              handedness,
              score,
              ...palmNormal,
              ...normFlat
            ];

            console.log(row);

            // save current row in memory
            collectedRows.current.push(row);
            console.log(`Collected rows: ${collectedRows.current.length}`);
          } else {
            console.log("FAILED TO RECOGNIZE HAND", handedness, HAND_USED_IN_TRAINING)
          }

        } else {
          console.log("SCORE BELOW THRESH", score, HANDNESS_SCORE_THRESH);
        }

      } else {
        console.log("FINISHED, downloadCSV")
      }

      // the return is here used so that execution here stops, no need for more than this code to build the dataset csv rows
      return;


  */