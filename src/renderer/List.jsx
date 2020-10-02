import React, { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
const { ipcRenderer } = window.require("electron");
import { useIsMount } from "./hooks/useIsMount";
import debounce from "lodash/debounce";

function randSentence() {
  var verbs, nouns, adjectives, adverbs, preposition;
  nouns = [
    "bird",
    "clock",
    "boy",
    "plastic",
    "duck",
    "teacher",
    "old lady",
    "professor",
    "hamster",
    "dog",
  ];
  verbs = [
    "kicked",
    "ran",
    "flew",
    "dodged",
    "sliced",
    "rolled",
    "died",
    "breathed",
    "slept",
    "killed",
  ];
  adjectives = [
    "beautiful",
    "lazy",
    "professional",
    "lovely",
    "dumb",
    "rough",
    "soft",
    "hot",
    "vibrating",
    "slimy",
  ];
  adverbs = [
    "slowly",
    "elegantly",
    "precisely",
    "quickly",
    "sadly",
    "humbly",
    "proudly",
    "shockingly",
    "calmly",
    "passionately",
  ];
  preposition = [
    "down",
    "into",
    "up",
    "on",
    "upon",
    "below",
    "above",
    "through",
    "across",
    "towards",
  ];

  var rand1 = Math.floor(Math.random() * 10);
  var rand2 = Math.floor(Math.random() * 10);
  var rand3 = Math.floor(Math.random() * 10);
  var rand4 = Math.floor(Math.random() * 10);
  var rand5 = Math.floor(Math.random() * 10);
  var rand6 = Math.floor(Math.random() * 10);

  var content =
    "The " +
    adjectives[rand1] +
    " " +
    nouns[rand2] +
    " " +
    adverbs[rand3] +
    " " +
    verbs[rand4] +
    " because some " +
    nouns[rand1] +
    " " +
    adverbs[rand1] +
    " " +
    verbs[rand1] +
    " " +
    preposition[rand1] +
    " a " +
    adjectives[rand2] +
    " " +
    nouns[rand5] +
    " which, became a " +
    adjectives[rand3] +
    ", " +
    adjectives[rand4] +
    " " +
    nouns[rand6] +
    ".";

  return content;
}

// send to store
const debouncedSendState = debounce((state) => {
  // alert("nice");
  ipcRenderer.send("SET_STATE", state);
}, 200);

// fake data generator
const getItems = (count, offset = 0) =>
  Array.from({ length: count }, (v, k) => k).map((k) => ({
    id: `item-${k + offset}-${new Date().getTime()}`,
    content: randSentence(),
  }));

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source.items);
  const destClone = Array.from(destination.items);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};
const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  paddingRight: 6 * grid,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",

  // styles we need to apply on draggables
  ...draggableStyle,
});
const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: grid,
  width: 350,
});

const MainThread = ({
  mainThreadIds = ["a", "b"],
  state = [],
  setMainThreadIds,
}) => {
  let items = [];

  for (const id of mainThreadIds) {
    for (const group of state) {
      for (const item of group.items) {
        if (item.id === id) items.push(item);
      }
    }
  }

  function onDragEnd(result) {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }
    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if (sInd === dInd) {
      const newIds = reorder(mainThreadIds, source.index, destination.index);
      setMainThreadIds(newIds);
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={`1`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
            {...provided.droppableProps}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getItemStyle(
                      snapshot.isDragging,
                      provided.draggableProps.style
                    )}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-around",
                      }}
                    >
                      <textarea
                        cols="40"
                        rows="5"
                        type="text"
                        style={{ resize: "none" }}
                        value={item.content}
                        onChange={(e) =>
                          handleChangeContent(e.target.value, ind, index)
                        }
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newMainThreadIds = [...mainThreadIds];
                          const index = mainThreadIds.indexOf(item.id)
                          newMainThreadIds.splice(index, 1);
                          setMainThreadIds(newMainThreadIds);
                        }}
                      >
                        X From main
                      </button>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

function List() {
  // const getStoredState = () => {
  //   let state = {}

  //   ipcRenderer.on('INITIALIZE_STATE', (event, stored_state) => {
  //     if (Object.keys(stored_state).length === 0) {
  //       state = [
  //         { name: "list 1", items: getItems(5) },
  //         { name: "list 2", items: getItems(5, 10) },
  //       ]
  //     } else {
  //       state = stored_state
  //     }

  //     return state
  //   });
  // }

  const isMount = useIsMount();
  const [state, setState] = useState([]);
  const [mainThreadIds, setMainThreadIds] = useState([]);

  useEffect(() => {
    ipcRenderer.on("INITIALIZE_STATE", (event, stored_state) => {
      if (stored_state) setState(stored_state);
    });
  }, []);

  useEffect(() => {
    !isMount && debouncedSendState(state);
  });

  function onDragEnd(result) {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }
    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if (sInd === dInd) {
      const items = reorder(state[sInd].items, source.index, destination.index);
      const newState = [...state];
      newState[sInd].items = items;
      setState(newState);
    } else {
      const result = move(state[sInd], state[dInd], source, destination);
      const newState = [...state];
      newState[sInd].items = result[sInd];
      newState[dInd].items = result[dInd];

      // setState(newState.filter(group => group.length));
      setState(newState);
    }
  }

  const removeGroup = (ind) => {
    const newState = [...state];
    newState.splice(ind, 1);

    setState(newState);
  };

  const addNewItem = (ind) => {
    const newState = [...state];
    newState[ind].items = getItems(1).concat(newState[ind].items);

    setState(newState);
  };

  const handleChangeName = (new_name, ind) => {
    const newState = [...state];
    newState[ind].name = new_name;

    setState(newState);
  };

  const handleChangeContent = (content, ind, index) => {
    const newState = [...state];
    newState[ind].items[index].content = content;

    setState(newState);
  };

  return (
    <div>
      <MainThread
        mainThreadIds={mainThreadIds}
        state={state}
        setMainThreadIds={setMainThreadIds}
      />

      <div style={{ display: "flex" }}>
        <DragDropContext onDragEnd={onDragEnd}>
          {state.map((el, ind) => (
            <div key={ind}>
              <div>
                <input
                  type="text"
                  value={el.name}
                  onChange={(e) => handleChangeName(e.target.value, ind)}
                />
              </div>
              <button type="button" onClick={() => addNewItem(ind)}>
                + New item
              </button>
              <button type="button" onClick={() => removeGroup(ind)}>
                X Delete group
              </button>

              <Droppable droppableId={`${ind}`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                    {...provided.droppableProps}
                  >
                    {el.items.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                              snapshot.isDragging,
                              provided.draggableProps.style
                            )}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-around",
                              }}
                            >
                              <textarea
                                cols="40"
                                rows="5"
                                type="text"
                                style={{ resize: "none" }}
                                value={item.content}
                                onChange={(e) =>
                                  handleChangeContent(
                                    e.target.value,
                                    ind,
                                    index
                                  )
                                }
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newState = [...state];
                                  newState[ind].items.splice(index, 1);
                                  setState(newState);
                                }}
                              >
                                X
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  var test = mainThreadIds.indexOf(item.id);
                                  if (test === -1)
                                    setMainThreadIds(
                                      [...mainThreadIds].concat([item.id])
                                    );

                                  console.log(mainThreadIds);
                                }}
                              >
                                + Add to main
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </DragDropContext>
        <div style={{ marginLeft: 2 * grid, marginTop: 5 * grid }}>
          <button
            type="button"
            onClick={() => {
              setState([...state, { name: "new group", items: getItems(5) }]);
            }}
          >
            + New group
          </button>
        </div>
      </div>
    </div>
  );
}

export default List;
