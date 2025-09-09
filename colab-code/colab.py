# The following code was used on google colab to train the model for hand gestures recognition
# it works perfectly on google colab, here has been posted if anyone wants to reuse it


# dataset in csv format upload
from google.colab import files
uploaded = files.upload()

# duplicate check (safety)
import pandas as pd

df = pd.read_csv('gestures.csv')

# 2. removes duplicate rows if any
df_unique = df.drop_duplicates()

# 3. saves csv in a new csv file
df_unique.to_csv('gestures_no_duplicates.csv', index=False)

print(f"Original rows: {len(df)}, After deduplication: {len(df_unique)}")


# SHAPE OF DATA
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
import tensorflow as tf
from tensorflow import keras

# load dataset 'palm_nx','palm_ny','palm_nz')
df = pd.read_csv('gestures.csv')

# mapping labels to integers
labels = df['label']
label_map = {lab: i for i, lab in enumerate(sorted(labels.unique()))}
df['y'] = labels.map(label_map)

print('Labels', label_map)

# Map handedness (Left→0, Right→1)
df['handed_code'] = df['handedness'].map({'Left': 0, 'Right': 1})

# We use this format of data handedness_score + palm_n* + 63 landmark + handed_code  → tot = 1 + 3 + 63 + 1 = 68 labels in total
landmark_cols = [
    c for c in df.columns
    if any(c.endswith(s) for s in ('_x','_y','_z'))
]

feature_cols = [
    'handedness_score',
    'palm_nx', 'palm_ny', 'palm_nz',
    *landmark_cols,
    'handed_code'
]

print("Features order:", feature_cols)

X = df[feature_cols].values.astype(np.float32)
y = df['y'].values.astype(np.int32)
num_classes = len(label_map)

print("Shape features:", X.shape)  # prints (N, 68)

# MODEL INITIALIZATION
# split 70% train, 15% val, 15% test
X_temp, X_test, y_temp, y_test = train_test_split(
    X, y, test_size=0.15, stratify=y, random_state=42
)
val_frac = 0.15 / 0.85
X_train, X_val, y_train, y_val = train_test_split(
    X_temp, y_temp,
    test_size=val_frac,
    stratify=y_temp,
    random_state=42
)

# Model (FFN feed-forward network or MLP multi layer perceptron) we are using Keras
model = keras.Sequential([
    keras.layers.Input(shape=(X_train.shape[1],)),
    keras.layers.Dense(64, activation='relu'),
    keras.layers.Dense(32, activation='relu'),
    keras.layers.Dense(num_classes, activation='softmax'),
])
# optimizer, loss, metrics
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# Early stopping init
es = keras.callbacks.EarlyStopping(
    monitor='val_loss',
    patience=5,
    restore_best_weights=True
)

# MODEL TRAINING
history = model.fit(
    X_train, y_train,
    validation_data=(X_val, y_val),
    epochs=50,
    batch_size=16,
    callbacks=[es]
)

# MODEL TEST
test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
print(f"Test Loss: {test_loss:.4f}   Test Acc: {test_acc:.4f}")

# EXPORT RESULT TO TFLITE used in React
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()
with open('gesture_classifier.tflite', 'wb') as f:
    f.write(tflite_model)
print("Model TFLite saved — classes:", label_map)