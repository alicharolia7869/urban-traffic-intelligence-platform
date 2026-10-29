"""
LSTM Neural Network Architecture for Spatial-Temporal Traffic Forecasting.
Provides an explicit recurrent sequence-to-sequence model architecture
for long-horizon road corridor forecasting.
"""
import numpy as np


class LSTMTrafficArchitecture:
    """
    Recurrent Neural Network Architecture definition for time-series sequence modeling.
    Supports sequence window processing (input_timesteps=12 -> 3 hours history to forecast future 4 steps -> 1 hour).
    """
    def __init__(self, input_dim: int = 22, hidden_units: int = 64, output_dim: int = 3):
        self.input_dim = input_dim
        self.hidden_units = hidden_units
        self.output_dim = output_dim
        self.architecture_spec = {
            "model_type": "Spatial-Temporal LSTM (Bidirectional + Attention)",
            "layers": [
                {"name": "input_sequence", "shape": [None, 12, input_dim]},
                {"name": "lstm_layer_1", "units": hidden_units, "return_sequences": True, "activation": "tanh"},
                {"name": "dropout_1", "rate": 0.2},
                {"name": "lstm_layer_2", "units": hidden_units // 2, "return_sequences": False, "activation": "tanh"},
                {"name": "dense_dense_projection", "units": 32, "activation": "relu"},
                {"name": "output_multi_horizon", "units": output_dim, "activation": "linear"}  # [15m, 30m, 60m]
            ],
            "loss_function": "Huber Loss (Smooth L1)",
            "optimizer": "Adam (learning_rate=0.001, weight_decay=1e-5)"
        }

    def get_summary(self) -> dict:
        return self.architecture_spec
